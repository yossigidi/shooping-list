"""
Application configuration settings
"""
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App settings
    APP_NAME: str = "ListNest Price Comparison API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API settings
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://listnest:listnest@localhost:5432/listnest"
    DATABASE_SYNC_URL: str = "postgresql://listnest:listnest@localhost:5432/listnest"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL: int = 3600  # 1 hour cache

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Scraper settings
    SCRAPER_DATA_DIR: str = "/tmp/supermarket_data"
    SCRAPER_ENABLED_CHAINS: List[str] = [
        "shufersal",
        "rami_levy",
        "victory",
        "yeinot_bitan",
        "mega",
        "hatzi_hinam",
        "tiv_taam",
        "osher_ad",
        "yohananof",
        "super_pharm",
        "freshmarket",
        "stop_market",
        "king_store",
        "shuk_hair",
        "carrefour"
    ]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Chain mappings for Israeli supermarkets
CHAIN_MAPPINGS = {
    "shufersal": {"id": 1, "name": "שופרסל", "name_en": "Shufersal"},
    "rami_levy": {"id": 2, "name": "רמי לוי", "name_en": "Rami Levy"},
    "victory": {"id": 3, "name": "ויקטורי", "name_en": "Victory"},
    "yeinot_bitan": {"id": 4, "name": "יינות ביתן", "name_en": "Yeinot Bitan"},
    "mega": {"id": 5, "name": "מגה", "name_en": "Mega"},
    "hatzi_hinam": {"id": 6, "name": "חצי חינם", "name_en": "Hatzi Hinam"},
    "tiv_taam": {"id": 7, "name": "טיב טעם", "name_en": "Tiv Taam"},
    "osher_ad": {"id": 8, "name": "אושר עד", "name_en": "Osher Ad"},
    "yohananof": {"id": 9, "name": "יוחננוף", "name_en": "Yohananof"},
    "super_pharm": {"id": 10, "name": "סופר פארם", "name_en": "Super Pharm"},
    "freshmarket": {"id": 11, "name": "פרש מרקט", "name_en": "Fresh Market"},
    "stop_market": {"id": 12, "name": "סטופ מרקט", "name_en": "Stop Market"},
    "king_store": {"id": 13, "name": "קינג סטור", "name_en": "King Store"},
    "shuk_hair": {"id": 14, "name": "שוק העיר", "name_en": "Shuk HaIr"},
    "carrefour": {"id": 15, "name": "קרפור", "name_en": "Carrefour"},
    "be": {"id": 16, "name": "Be", "name_en": "Be"},
    "zol_vbigadol": {"id": 17, "name": "זול ובגדול", "name_en": "Zol VBigadol"},
    "maayan_2000": {"id": 18, "name": "מעיין 2000", "name_en": "Maayan 2000"},
    "super_yuda": {"id": 19, "name": "סופר יודה", "name_en": "Super Yuda"},
    "politzer": {"id": 20, "name": "פוליצר", "name_en": "Politzer"},
}
