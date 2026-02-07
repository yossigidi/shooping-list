"""
Celery application configuration
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "listnest",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.tasks.price_tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Jerusalem",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max per task
    worker_prefetch_multiplier=1,
    worker_concurrency=2,
)

# Beat schedule - automated tasks
celery_app.conf.beat_schedule = {
    # Update prices twice daily at 6 AM and 6 PM Israel time
    "update-prices-morning": {
        "task": "app.tasks.price_tasks.update_all_prices",
        "schedule": crontab(hour=6, minute=0),
        "options": {"queue": "prices"}
    },
    "update-prices-evening": {
        "task": "app.tasks.price_tasks.update_all_prices",
        "schedule": crontab(hour=18, minute=0),
        "options": {"queue": "prices"}
    },
    # Cleanup old files weekly
    "cleanup-old-files": {
        "task": "app.tasks.price_tasks.cleanup_old_data",
        "schedule": crontab(hour=3, minute=0, day_of_week=0),  # Sunday 3 AM
        "options": {"queue": "maintenance"}
    },
    # Record price history daily
    "record-price-history": {
        "task": "app.tasks.price_tasks.record_price_history",
        "schedule": crontab(hour=23, minute=0),
        "options": {"queue": "maintenance"}
    }
}

# Task routing
celery_app.conf.task_routes = {
    "app.tasks.price_tasks.update_*": {"queue": "prices"},
    "app.tasks.price_tasks.cleanup_*": {"queue": "maintenance"},
    "app.tasks.price_tasks.record_*": {"queue": "maintenance"},
}
