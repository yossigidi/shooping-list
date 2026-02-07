"""
Base scraper class for Israeli supermarket price data
"""
import os
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Optional, Generator
from dataclasses import dataclass
from decimal import Decimal

import httpx
from lxml import etree

from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


@dataclass
class ScrapedProduct:
    """Scraped product data"""
    barcode: str
    name: str
    manufacturer: Optional[str] = None
    manufacturer_country: Optional[str] = None
    unit_type: Optional[str] = None
    unit_quantity: Optional[Decimal] = None
    category: Optional[str] = None


@dataclass
class ScrapedPrice:
    """Scraped price data"""
    barcode: str
    chain_id: str
    store_id: str
    price: Decimal
    unit_price: Optional[Decimal] = None
    is_on_sale: bool = False
    sale_price: Optional[Decimal] = None
    promotion_description: Optional[str] = None
    update_time: Optional[datetime] = None


class BaseScraper(ABC):
    """Base class for supermarket scrapers"""

    def __init__(self, chain_id: str, chain_name: str):
        self.chain_id = chain_id
        self.chain_name = chain_name
        self.data_dir = os.path.join(settings.SCRAPER_DATA_DIR, chain_id)
        os.makedirs(self.data_dir, exist_ok=True)

        self.client = httpx.Client(
            timeout=60.0,
            follow_redirects=True,
            headers={
                "User-Agent": "ListNest Price Scraper/1.0"
            }
        )

    def __del__(self):
        if hasattr(self, 'client'):
            self.client.close()

    @abstractmethod
    def get_price_files_urls(self) -> List[str]:
        """Get URLs of price XML files to download"""
        pass

    @abstractmethod
    def parse_price_file(self, file_path: str) -> Generator[ScrapedPrice, None, None]:
        """Parse a price XML file and yield price records"""
        pass

    def download_file(self, url: str, filename: str) -> Optional[str]:
        """Download a file from URL"""
        try:
            response = self.client.get(url)
            response.raise_for_status()

            file_path = os.path.join(self.data_dir, filename)

            # Handle gzip content
            content = response.content
            if filename.endswith('.gz'):
                import gzip
                content = gzip.decompress(content)
                file_path = file_path[:-3]  # Remove .gz extension

            with open(file_path, 'wb') as f:
                f.write(content)

            logger.info(f"Downloaded {url} to {file_path}")
            return file_path

        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return None

    def scrape_prices(self) -> Generator[ScrapedPrice, None, None]:
        """Main scraping method - downloads and parses all price files"""
        urls = self.get_price_files_urls()
        logger.info(f"Found {len(urls)} price files for {self.chain_name}")

        for i, url in enumerate(urls):
            filename = f"prices_{i}_{datetime.now().strftime('%Y%m%d')}.xml"
            file_path = self.download_file(url, filename)

            if file_path:
                try:
                    yield from self.parse_price_file(file_path)
                except Exception as e:
                    logger.error(f"Failed to parse {file_path}: {e}")

    def cleanup_old_files(self, days: int = 7):
        """Remove downloaded files older than specified days"""
        import time
        now = time.time()
        cutoff = now - (days * 86400)

        for filename in os.listdir(self.data_dir):
            file_path = os.path.join(self.data_dir, filename)
            if os.path.isfile(file_path) and os.path.getmtime(file_path) < cutoff:
                os.remove(file_path)
                logger.info(f"Removed old file: {file_path}")


class IsraeliSupermarketScraper(BaseScraper):
    """
    Generic scraper for Israeli supermarkets using the standard XML format
    mandated by the Price Transparency Law.

    Most chains use the same XML schema:
    - PriceFull: Full price catalog
    - Prices: Price updates
    - PromosFull: Promotions
    """

    # Common XML namespaces used by chains
    NAMESPACES = {
        'default': 'http://www.superchain.co.il/xml/superchain'
    }

    def __init__(self, chain_id: str, chain_name: str, base_url: str):
        super().__init__(chain_id, chain_name)
        self.base_url = base_url

    def get_price_files_urls(self) -> List[str]:
        """
        Get price file URLs from the chain's FTP/HTTP server.
        Override this method for chains with different URL patterns.
        """
        # Default implementation - chains typically list files at base_url
        try:
            response = self.client.get(self.base_url)
            response.raise_for_status()

            # Parse HTML to find XML file links
            from lxml import html
            tree = html.fromstring(response.content)
            links = tree.xpath('//a/@href')

            price_files = [
                link if link.startswith('http') else f"{self.base_url.rstrip('/')}/{link}"
                for link in links
                if 'PriceFull' in link or 'Prices' in link
            ]

            return price_files[:10]  # Limit to 10 files per update

        except Exception as e:
            logger.error(f"Failed to get price file URLs: {e}")
            return []

    def parse_price_file(self, file_path: str) -> Generator[ScrapedPrice, None, None]:
        """Parse standard Israeli supermarket XML price file"""
        try:
            # Parse XML with iterparse for memory efficiency
            context = etree.iterparse(file_path, events=('end',), tag='Item')

            for event, elem in context:
                try:
                    barcode = self._get_text(elem, 'ItemCode') or self._get_text(elem, 'Barcode')
                    price_str = self._get_text(elem, 'ItemPrice')

                    if barcode and price_str:
                        yield ScrapedPrice(
                            barcode=barcode,
                            chain_id=self.chain_id,
                            store_id=self._get_text(elem, 'StoreId') or '0',
                            price=Decimal(price_str),
                            unit_price=self._parse_decimal(self._get_text(elem, 'UnitOfMeasurePrice')),
                            is_on_sale=self._get_text(elem, 'ItemStatus') == '1',
                            update_time=self._parse_datetime(self._get_text(elem, 'PriceUpdateDate'))
                        )
                except Exception as e:
                    logger.debug(f"Failed to parse item: {e}")

                # Clear element to free memory
                elem.clear()
                while elem.getprevious() is not None:
                    del elem.getparent()[0]

        except Exception as e:
            logger.error(f"Failed to parse XML file {file_path}: {e}")

    def _get_text(self, elem: etree._Element, tag: str) -> Optional[str]:
        """Get text content of child element"""
        child = elem.find(tag)
        if child is not None and child.text:
            return child.text.strip()
        return None

    def _parse_decimal(self, value: Optional[str]) -> Optional[Decimal]:
        """Parse string to Decimal"""
        if value:
            try:
                return Decimal(value)
            except:
                pass
        return None

    def _parse_datetime(self, value: Optional[str]) -> Optional[datetime]:
        """Parse datetime string"""
        if value:
            for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%Y%m%d%H%M%S']:
                try:
                    return datetime.strptime(value, fmt)
                except:
                    continue
        return None
