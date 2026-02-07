"""
Celery tasks for price scraping and database updates
"""
import logging
from datetime import datetime
from decimal import Decimal
from typing import Optional

from celery import shared_task
from sqlalchemy import create_engine, select, update
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert

from app.core.config import get_settings, CHAIN_MAPPINGS
from app.models.models import Chain, Product, Price, PriceHistory
from app.scrapers.il_supermarket_integration import get_il_scraper

settings = get_settings()
logger = logging.getLogger(__name__)

# Sync engine for Celery tasks (Celery doesn't support async well)
sync_engine = create_engine(settings.DATABASE_SYNC_URL, pool_pre_ping=True)


def normalize_product_name(name: str) -> str:
    """Normalize product name for matching"""
    import re
    if not name:
        return ""
    name = re.sub(r'[^\w\s\u0590-\u05FF]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip().lower()
    return name


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def update_all_prices(self):
    """
    Update prices for all enabled chains.
    This is the main scheduled task that runs twice daily.
    """
    logger.info("Starting full price update for all chains")
    results = {"success": [], "failed": []}

    for chain_id in settings.SCRAPER_ENABLED_CHAINS:
        try:
            update_chain_prices.delay(chain_id)
            results["success"].append(chain_id)
        except Exception as e:
            logger.error(f"Failed to queue update for {chain_id}: {e}")
            results["failed"].append(chain_id)

    logger.info(f"Queued updates: {len(results['success'])} success, {len(results['failed'])} failed")
    return results


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def update_chain_prices(self, chain_id: str):
    """
    Update prices for a specific chain.

    Steps:
    1. Download price files from chain
    2. Parse XML files
    3. Upsert products and prices to database
    4. Log statistics
    """
    logger.info(f"Starting price update for chain: {chain_id}")

    try:
        scraper = get_il_scraper()

        # Ensure chain exists in database
        with Session(sync_engine) as session:
            chain = ensure_chain_exists(session, chain_id)
            if not chain:
                logger.error(f"Failed to create/find chain: {chain_id}")
                return {"error": "Chain not found"}

            db_chain_id = chain.id

        # Download data files
        files = scraper.download_chain_data(chain_id)
        if not files:
            logger.warning(f"No files downloaded for {chain_id}")
            return {"files": 0, "products": 0, "prices": 0}

        # Process each file
        total_products = 0
        total_prices = 0

        for file_path in files:
            logger.info(f"Processing file: {file_path}")

            products_batch = []
            prices_batch = []

            for record in scraper.parse_price_file(file_path, chain_id):
                # Prepare product upsert
                products_batch.append({
                    "barcode": record["barcode"],
                    "name": record.get("name") or f"Product {record['barcode']}",
                    "name_normalized": normalize_product_name(record.get("name", "")),
                    "category": record.get("category"),
                    "manufacturer": record.get("manufacturer"),
                    "unit_type": record.get("unit_type"),
                    "unit_quantity": record.get("unit_quantity"),
                })

                # Prepare price upsert
                prices_batch.append({
                    "barcode": record["barcode"],
                    "chain_id": db_chain_id,
                    "price": record["price"],
                    "unit_price": record.get("unit_price"),
                    "is_on_sale": record.get("is_on_sale", False),
                })

                # Batch insert every 1000 records
                if len(products_batch) >= 1000:
                    with Session(sync_engine) as session:
                        upsert_products(session, products_batch)
                        upsert_prices(session, prices_batch, db_chain_id)
                        session.commit()

                    total_products += len(products_batch)
                    total_prices += len(prices_batch)
                    products_batch = []
                    prices_batch = []

            # Insert remaining records
            if products_batch:
                with Session(sync_engine) as session:
                    upsert_products(session, products_batch)
                    upsert_prices(session, prices_batch, db_chain_id)
                    session.commit()

                total_products += len(products_batch)
                total_prices += len(prices_batch)

        logger.info(f"Completed {chain_id}: {total_products} products, {total_prices} prices")
        return {
            "chain": chain_id,
            "files": len(files),
            "products": total_products,
            "prices": total_prices
        }

    except Exception as e:
        logger.error(f"Failed to update {chain_id}: {e}")
        self.retry(exc=e)


def ensure_chain_exists(session: Session, chain_id: str) -> Optional[Chain]:
    """Ensure chain exists in database, create if not"""
    chain_info = CHAIN_MAPPINGS.get(chain_id)
    if not chain_info:
        return None

    # Check if exists
    stmt = select(Chain).where(Chain.code == chain_id)
    result = session.execute(stmt)
    chain = result.scalar_one_or_none()

    if chain:
        return chain

    # Create new chain
    chain = Chain(
        code=chain_id,
        name=chain_info["name_en"],
        name_he=chain_info["name"],
        is_active=True
    )
    session.add(chain)
    session.commit()
    session.refresh(chain)

    logger.info(f"Created chain: {chain_id}")
    return chain


def upsert_products(session: Session, products: list):
    """Upsert products using PostgreSQL ON CONFLICT"""
    if not products:
        return

    # Filter out duplicates by barcode
    seen = set()
    unique_products = []
    for p in products:
        if p["barcode"] not in seen:
            seen.add(p["barcode"])
            unique_products.append(p)

    stmt = insert(Product).values(unique_products)
    stmt = stmt.on_conflict_do_update(
        index_elements=["barcode"],
        set_={
            "name": stmt.excluded.name,
            "name_normalized": stmt.excluded.name_normalized,
            "category": stmt.excluded.category,
            "manufacturer": stmt.excluded.manufacturer,
            "unit_type": stmt.excluded.unit_type,
            "unit_quantity": stmt.excluded.unit_quantity,
            "updated_at": datetime.utcnow()
        }
    )
    session.execute(stmt)


def upsert_prices(session: Session, prices: list, chain_id: int):
    """Upsert prices using PostgreSQL ON CONFLICT"""
    if not prices:
        return

    # First, get product IDs for barcodes
    barcodes = [p["barcode"] for p in prices]
    stmt = select(Product.id, Product.barcode).where(Product.barcode.in_(barcodes))
    result = session.execute(stmt)
    barcode_to_id = {row.barcode: row.id for row in result}

    # Prepare price records with product_id
    price_records = []
    for p in prices:
        product_id = barcode_to_id.get(p["barcode"])
        if product_id:
            price_records.append({
                "product_id": product_id,
                "chain_id": chain_id,
                "price": p["price"],
                "unit_price": p.get("unit_price"),
                "is_on_sale": p.get("is_on_sale", False),
                "last_updated": datetime.utcnow()
            })

    if not price_records:
        return

    # Upsert prices
    stmt = insert(Price).values(price_records)
    stmt = stmt.on_conflict_do_update(
        constraint="uix_product_chain",
        set_={
            "price": stmt.excluded.price,
            "unit_price": stmt.excluded.unit_price,
            "is_on_sale": stmt.excluded.is_on_sale,
            "last_updated": datetime.utcnow()
        }
    )
    session.execute(stmt)


@shared_task
def record_price_history():
    """
    Record current prices to history table.
    Runs daily to track price changes over time.
    """
    logger.info("Recording price history")

    with Session(sync_engine) as session:
        # Get all current prices
        stmt = select(Price)
        result = session.execute(stmt)
        prices = result.scalars().all()

        # Insert into history
        history_records = [
            PriceHistory(
                product_id=p.product_id,
                chain_id=p.chain_id,
                price=p.price,
                was_on_sale=p.is_on_sale,
                recorded_at=datetime.utcnow()
            )
            for p in prices
        ]

        session.add_all(history_records)
        session.commit()

        logger.info(f"Recorded {len(history_records)} price history entries")
        return {"recorded": len(history_records)}


@shared_task
def cleanup_old_data():
    """
    Clean up old data files and history.
    Runs weekly.
    """
    import os
    import time
    from datetime import timedelta

    logger.info("Cleaning up old data")

    # Clean up downloaded files older than 7 days
    cutoff = time.time() - (7 * 86400)
    removed_files = 0

    for root, dirs, files in os.walk(settings.SCRAPER_DATA_DIR):
        for filename in files:
            file_path = os.path.join(root, filename)
            if os.path.getmtime(file_path) < cutoff:
                os.remove(file_path)
                removed_files += 1

    # Clean up history older than 90 days
    with Session(sync_engine) as session:
        from sqlalchemy import delete
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        stmt = delete(PriceHistory).where(PriceHistory.recorded_at < cutoff_date)
        result = session.execute(stmt)
        session.commit()
        deleted_history = result.rowcount

    logger.info(f"Cleanup complete: {removed_files} files, {deleted_history} history records")
    return {"files_removed": removed_files, "history_deleted": deleted_history}
