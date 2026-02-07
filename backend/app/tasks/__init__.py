# Celery tasks module
from app.tasks.celery_app import celery_app
from app.tasks.price_tasks import update_all_prices, update_chain_prices

__all__ = ["celery_app", "update_all_prices", "update_chain_prices"]
