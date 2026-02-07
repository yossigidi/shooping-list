"""
Specific scrapers for each Israeli supermarket chain
"""
import os
import re
import logging
from typing import List, Generator
from decimal import Decimal
from datetime import datetime

from app.scrapers.base_scraper import IsraeliSupermarketScraper, ScrapedPrice, ScrapedProduct
from app.core.config import CHAIN_MAPPINGS

logger = logging.getLogger(__name__)


class ShufersalScraper(IsraeliSupermarketScraper):
    """Scraper for Shufersal (שופרסל)"""

    def __init__(self):
        super().__init__(
            chain_id="shufersal",
            chain_name="שופרסל",
            base_url="http://prices.shufersal.co.il/"
        )

    def get_price_files_urls(self) -> List[str]:
        """Get Shufersal price files"""
        try:
            from lxml import html
            response = self.client.get(f"{self.base_url}FileObject/UpdateCategory?catID=2")
            response.raise_for_status()

            tree = html.fromstring(response.content)
            links = tree.xpath('//a[contains(@href, "PriceFull")]/@href')

            return [f"{self.base_url}{link.lstrip('/')}" for link in links[:10]]
        except Exception as e:
            logger.error(f"Shufersal URL fetch failed: {e}")
            return []


class RamiLevyScraper(IsraeliSupermarketScraper):
    """Scraper for Rami Levy (רמי לוי)"""

    def __init__(self):
        super().__init__(
            chain_id="rami_levy",
            chain_name="רמי לוי",
            base_url="https://url.retail.publishedprices.co.il/file/d_rami_levy/"
        )

    def get_price_files_urls(self) -> List[str]:
        """Get Rami Levy price files from Retail API"""
        try:
            # Retail API requires login
            login_url = "https://url.retail.publishedprices.co.il/login"
            self.client.post(login_url, data={"username": "RamiLevi"})

            response = self.client.get(self.base_url)
            response.raise_for_status()

            data = response.json()
            files = [
                f"https://url.retail.publishedprices.co.il/file/{f['name']}"
                for f in data.get('files', [])
                if 'PriceFull' in f.get('name', '')
            ]
            return files[:10]
        except Exception as e:
            logger.error(f"Rami Levy URL fetch failed: {e}")
            return []


class VictoryScraper(IsraeliSupermarketScraper):
    """Scraper for Victory (ויקטורי)"""

    def __init__(self):
        super().__init__(
            chain_id="victory",
            chain_name="ויקטורי",
            base_url="http://matrixcatalog.co.il/NBCompetitionReg498.aspx"
        )


class YeinotBitanScraper(IsraeliSupermarketScraper):
    """Scraper for Yeinot Bitan (יינות ביתן)"""

    def __init__(self):
        super().__init__(
            chain_id="yeinot_bitan",
            chain_name="יינות ביתן",
            base_url="http://publishprice.ybitan.co.il/"
        )


class MegaScraper(IsraeliSupermarketScraper):
    """Scraper for Mega (מגה)"""

    def __init__(self):
        super().__init__(
            chain_id="mega",
            chain_name="מגה",
            base_url="http://publishprice.mega.co.il/"
        )


class HatziHinamScraper(IsraeliSupermarketScraper):
    """Scraper for Hatzi Hinam (חצי חינם)"""

    def __init__(self):
        super().__init__(
            chain_id="hatzi_hinam",
            chain_name="חצי חינם",
            base_url="http://prices.super-hatzihinam.co.il/"
        )


class TivTaamScraper(IsraeliSupermarketScraper):
    """Scraper for Tiv Taam (טיב טעם)"""

    def __init__(self):
        super().__init__(
            chain_id="tiv_taam",
            chain_name="טיב טעם",
            base_url="http://prices.tivtaam.co.il/"
        )


class OsherAdScraper(IsraeliSupermarketScraper):
    """Scraper for Osher Ad (אושר עד)"""

    def __init__(self):
        super().__init__(
            chain_id="osher_ad",
            chain_name="אושר עד",
            base_url="http://prices.osherad.co.il/"
        )


class YohananofScraper(IsraeliSupermarketScraper):
    """Scraper for Yohananof (יוחננוף)"""

    def __init__(self):
        super().__init__(
            chain_id="yohananof",
            chain_name="יוחננוף",
            base_url="http://prices.yohananof.co.il/"
        )


# Factory for creating scrapers
SCRAPER_CLASSES = {
    "shufersal": ShufersalScraper,
    "rami_levy": RamiLevyScraper,
    "victory": VictoryScraper,
    "yeinot_bitan": YeinotBitanScraper,
    "mega": MegaScraper,
    "hatzi_hinam": HatziHinamScraper,
    "tiv_taam": TivTaamScraper,
    "osher_ad": OsherAdScraper,
    "yohananof": YohananofScraper,
}


def get_scraper(chain_id: str) -> IsraeliSupermarketScraper:
    """Get scraper instance for a chain"""
    scraper_class = SCRAPER_CLASSES.get(chain_id)
    if scraper_class:
        return scraper_class()

    # Default scraper for chains without specific implementation
    chain_info = CHAIN_MAPPINGS.get(chain_id)
    if chain_info:
        return IsraeliSupermarketScraper(
            chain_id=chain_id,
            chain_name=chain_info['name'],
            base_url=f"http://prices.{chain_id.replace('_', '')}.co.il/"
        )

    raise ValueError(f"Unknown chain: {chain_id}")
