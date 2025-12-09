"""Celery 任务模块."""

from celery import Celery

from sitemap_monitor.config import get_settings

settings = get_settings()

# 创建 Celery 应用
celery_app = Celery(
    "sitemap_monitor",
    broker=str(settings.redis_url),
    backend=str(settings.redis_url),
)

# Celery 配置
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 分钟任务超时
    task_soft_time_limit=540,  # 9 分钟软超时
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    imports=["sitemap_monitor.tasks.scheduler", "sitemap_monitor.tasks.cleanup"],
)

# Celery Beat 定时任务配置
celery_app.conf.beat_schedule = {
    "check-sitemaps-every-minute": {
        "task": "sitemap_monitor.tasks.scheduler.dispatch_pending_checks",
        "schedule": 60.0,  # 每分钟执行
    },
    "cleanup-old-data-daily": {
        "task": "sitemap_monitor.tasks.cleanup.cleanup_old_data",
        "schedule": 86400.0,  # 每天执行
    },
}
