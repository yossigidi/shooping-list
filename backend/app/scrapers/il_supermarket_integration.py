"""
Integration with the il-supermarket-scarper library
https://github.com/erlichsefi/israeli-supermarket-scarpers

This provides a higher-level interface using the community-maintained library.
"""
import os
import logging
from typing import List, Dict, Generator, Optional
from datetime import datetime
from decimal import Decimal

from app.core.config import get_settings, CHAIN_MAPPINGS

settings = get_settings()
logger = logging.getLogger(__name__)


# Try to import the il-supermarket-scarper library
try:
    from il_supermarket_scarper import ScarpingTask
    from il_supermarket_scarper.engines import Bina, Cerberus, Matrix, Shufersal, SuperPharm
    IL_SCRAPER_AVAILABLE = True
except ImportError:
    IL_SCRAPER_AVAILABLE = False
    logger.warning("il-supermarket-scarper not installed. Using fallback scrapers.")


class ILSupermarketIntegration:
    """
    Integration layer for the il-supermarket-scarper library.

    This library handles the complexity of different chain formats and
    provides a unified interface for downloading and parsing price data.
    """

    # Mapping from our chain IDs to library engine classes
    ENGINE_MAP = {
        "shufersal": "Shufersal",
        "rami_levy": "Cerberus",  # Uses Cerberus/Retail API
        "victory": "Matrix",
        "yeinot_bitan": "Bina",
        "mega": "Bina",
        "hatzi_hinam": "Cerberus",
        "tiv_taam": "Cerberus",
        "osher_ad": "Bina",
        "yohananof": "Cerberus",
        "super_pharm": "SuperPharm",
        "freshmarket": "Cerberus",
        "stop_market": "Cerberus",
        "king_store": "Cerberus",
        "shuk_hair": "Cerberus",
        "carrefour": "Bina",
    }

    def __init__(self):
        self.data_dir = settings.SCRAPER_DATA_DIR
        os.makedirs(self.data_dir, exist_ok=True)

    def download_chain_data(self, chain_id: str) -> List[str]:
        """
        Download price data for a specific chain.
        Returns list of downloaded file paths.
        """
        if not IL_SCRAPER_AVAILABLE:
            logger.error("il-supermarket-scarper not available")
            return []

        try:
            chain_dir = os.path.join(self.data_dir, chain_id)
            os.makedirs(chain_dir, exist_ok=True)

            # Create scraping task
            task = ScarpingTask(
                dump_folder=chain_dir,
                only_latest=True,  # Only get latest prices
                files_types=["PriceFull"],  # Full price files
            )

            # Get engine for this chain
            engine_name = self.ENGINE_MAP.get(chain_id)
            if not engine_name:
                logger.warning(f"No engine mapping for chain: {chain_id}")
                return []

            # Run the scraper
            logger.info(f"Downloading data for {chain_id} using {engine_name}")
            task.run()

            # Return downloaded files
            files = []
            for filename in os.listdir(chain_dir):
                if filename.endswith('.xml') or filename.endswith('.xml.gz'):
                    files.append(os.path.join(chain_dir, filename))

            logger.info(f"Downloaded {len(files)} files for {chain_id}")
            return files

        except Exception as e:
            logger.error(f"Failed to download data for {chain_id}: {e}")
            return []

    def download_all_chains(self) -> Dict[str, List[str]]:
        """
        Download data for all enabled chains.
        Returns dict mapping chain_id to list of file paths.
        """
        results = {}
        for chain_id in settings.SCRAPER_ENABLED_CHAINS:
            files = self.download_chain_data(chain_id)
            if files:
                results[chain_id] = files
        return results

    def parse_price_file(self, file_path: str, chain_id: str) -> Generator[Dict, None, None]:
        """
        Parse a price XML file and yield price records.
        """
        import gzip
        from lxml import etree

        try:
            # Handle gzipped files
            if file_path.endswith('.gz'):
                with gzip.open(file_path, 'rb') as f:
                    tree = etree.parse(f)
            else:
                tree = etree.parse(file_path)

            root = tree.getroot()

            # Extract store ID from file metadata
            store_id = "0"
            store_elem = root.find('.//StoreId')
            if store_elem is not None and store_elem.text:
                store_id = store_elem.text.strip()

            # Find all items
            items = root.findall('.//Item') or root.findall('.//Product')

            for item in items:
                try:
                    barcode = self._get_elem_text(item, 'ItemCode', 'Barcode', 'ItemBarcode')
                    price_str = self._get_elem_text(item, 'ItemPrice', 'Price')
                    name = self._get_elem_text(item, 'ItemName', 'ItemNm', 'ProductName')

                    if barcode and price_str:
                        yield {
                            'barcode': barcode,
                            'name': name,
                            'chain_id': chain_id,
                            'store_id': store_id,
                            'price': Decimal(price_str),
                            'unit_price': self._parse_decimal(
                                self._get_elem_text(item, 'UnitOfMeasurePrice', 'UnitPrice')
                            ),
                            'unit_type': self._get_elem_text(item, 'UnitOfMeasure', 'UnitQty'),
                            'unit_quantity': self._parse_decimal(
                                self._get_elem_text(item, 'Quantity', 'UnitQty')
                            ),
                            'manufacturer': self._get_elem_text(item, 'ManufacturerName', 'Manufacturer'),
                            'category': self._get_elem_text(item, 'ItemSection', 'Category'),
                            'is_on_sale': self._get_elem_text(item, 'ItemStatus') == '1',
                            'update_time': datetime.now()
                        }
                except Exception as e:
                    logger.debug(f"Failed to parse item: {e}")
                    continue

        except Exception as e:
            logger.error(f"Failed to parse file {file_path}: {e}")

    def _get_elem_text(self, parent, *tags) -> Optional[str]:
        """Get text from first matching child element"""
        for tag in tags:
            elem = parent.find(f'.//{tag}')
            if elem is not None and elem.text:
                return elem.text.strip()
        return None

    def _parse_decimal(self, value: Optional[str]) -> Optional[Decimal]:
        """Parse string to Decimal"""
        if value:
            try:
                return Decimal(value)
            except:
                pass
        return None


# Convenience function
def get_il_scraper() -> ILSupermarketIntegration:
    """Get IL supermarket scraper instance"""
    return ILSupermarketIntegration()
