"""数据清理任务."""

import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete

from sitemap_monitor.tasks import celery_app
from sitemap_monitor.logging import get_logger
from sitemap_monitor.config import get_settings
from sitemap_monitor.models import (
    SitemapSnapshot,
    ChangeRecord,
    NotificationLog,
    get_session_factory,
)

logger = get_logger(__name__)


@celery_app.task
def cleanup_old_data() -> dict:
    """
    清理过期数据.

    每天执行，删除超过保留期限的快照和变更记录。
    """
    return asyncio.run(_cleanup_old_data_async())


async def _cleanup_old_data_async() -> dict:
    """异步清理过期数据."""
    settings = get_settings()
    session_factory = get_session_factory()

    async with session_factory() as db:
        now = datetime.now(timezone.utc)

        # 清理快照（90 天）
        snapshot_cutoff = now - timedelta(days=settings.snapshot_retention_days)
        result = await db.execute(
            delete(SitemapSnapshot).where(SitemapSnapshot.created_at < snapshot_cutoff)
        )
        deleted_snapshots = result.rowcount

        # 清理变更记录（90 天）
        change_cutoff = now - timedelta(days=settings.snapshot_retention_days)
        result = await db.execute(
            delete(ChangeRecord).where(ChangeRecord.created_at < change_cutoff)
        )
        deleted_changes = result.rowcount

        # 清理通知日志（30 天）
        log_cutoff = now - timedelta(days=settings.notification_log_retention_days)
        result = await db.execute(
            delete(NotificationLog).where(NotificationLog.sent_at < log_cutoff)
        )
        deleted_logs = result.rowcount

        await db.commit()

        logger.info(
            "Data cleanup completed",
            deleted_snapshots=deleted_snapshots,
            deleted_changes=deleted_changes,
            deleted_logs=deleted_logs,
        )

        return {
            "deleted_snapshots": deleted_snapshots,
            "deleted_changes": deleted_changes,
            "deleted_logs": deleted_logs,
        }
