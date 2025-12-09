"""定时任务调度器."""

import asyncio
from datetime import datetime, timedelta, timezone

from celery import shared_task
from sqlalchemy import select

from sitemap_monitor.tasks import celery_app
from sitemap_monitor.logging import get_logger
from sitemap_monitor.models import (
    MonitorTask,
    MonitorStatus,
    ChangeType,
    create_session_factory,
)
from sitemap_monitor.core.checker import check_sitemap
from sitemap_monitor.core.snapshot_service import (
    create_snapshot,
    compare_with_previous,
    create_change_record,
)
from sitemap_monitor.core.monitor_service import mark_monitor_checked
from sitemap_monitor.core.notifier import notify_change

logger = get_logger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def check_sitemap_task(self, monitor_id: str) -> dict:
    """
    检查单个 Sitemap 任务.

    Args:
        monitor_id: 监控任务 ID

    Returns:
        检查结果
    """
    return asyncio.run(_check_sitemap_async(monitor_id))


async def _check_sitemap_async(monitor_id: str) -> dict:
    """异步检查 Sitemap."""
    session_factory = create_session_factory()

    async with session_factory() as db:
        try:
            # 获取监控任务
            result = await db.execute(
                select(MonitorTask).where(MonitorTask.id == monitor_id)
            )
            monitor = result.scalar_one_or_none()

            if not monitor:
                logger.warning("Monitor not found", monitor_id=monitor_id)
                return {"success": False, "error": "监控任务不存在"}

            if monitor.status != MonitorStatus.ACTIVE.value:
                logger.info("Monitor not active", monitor_id=monitor_id, status=monitor.status)
                return {"success": False, "error": "监控任务未激活"}

            # 检查 Sitemap
            logger.info("Checking sitemap", monitor_id=monitor_id, url=monitor.sitemap_url)
            check_result = await check_sitemap(monitor.sitemap_url)

            if not check_result.success:
                # 标记检查失败
                await mark_monitor_checked(db, monitor, success=False, error=check_result.error)
                await db.commit()
                logger.warning(
                    "Sitemap check failed",
                    monitor_id=monitor_id,
                    error=check_result.error,
                )
                return {"success": False, "error": check_result.error}

            # 创建快照
            snapshot = await create_snapshot(
                db=db,
                monitor_task_id=monitor.id,
                urls=check_result.urls,
                fetch_duration_ms=check_result.fetch_duration_ms,
                parse_duration_ms=check_result.parse_duration_ms,
            )

            # 与上一个快照比较
            change_result, old_snapshot = await compare_with_previous(
                db, monitor.id, snapshot
            )

            # 创建变更记录
            is_initial = old_snapshot is None
            change_record = await create_change_record(
                db=db,
                monitor_task_id=monitor.id,
                old_snapshot=old_snapshot,
                new_snapshot=snapshot,
                change_result=change_result,
                is_initial=is_initial,
            )

            # 标记检查成功
            await mark_monitor_checked(db, monitor, success=True)

            # 如果有变更，发送通知
            if change_result.has_changes:
                await notify_change(db, change_record, monitor)
                logger.info(
                    "Changes detected",
                    monitor_id=monitor_id,
                    added=change_result.added_count,
                    removed=change_result.removed_count,
                    modified=change_result.modified_count,
                )

            await db.commit()

            return {
                "success": True,
                "url_count": check_result.url_count,
                "has_changes": change_result.has_changes,
                "added_count": change_result.added_count,
                "removed_count": change_result.removed_count,
                "modified_count": change_result.modified_count,
            }

        except Exception as e:
            await db.rollback()
            logger.error("Sitemap check error", monitor_id=monitor_id, error=str(e))
            raise


@celery_app.task
def dispatch_pending_checks() -> dict:
    """
    调度待检查的监控任务.

    每分钟执行，检查哪些任务需要执行检查。
    """
    return asyncio.run(_dispatch_pending_checks_async())


async def _dispatch_pending_checks_async() -> dict:
    """异步调度待检查任务."""
    session_factory = create_session_factory()

    async with session_factory() as db:
        now = datetime.now(timezone.utc)

        # 查找需要检查的监控任务
        # 条件：状态为 active，且（从未检查过 或 上次检查时间 + 间隔 <= 当前时间）
        result = await db.execute(
            select(MonitorTask).where(
                MonitorTask.status == MonitorStatus.ACTIVE.value,
            )
        )
        monitors = result.scalars().all()

        dispatched = 0
        for monitor in monitors:
            should_check = False

            if monitor.last_check_at is None:
                # 从未检查过
                should_check = True
            else:
                # 检查是否到达间隔时间
                next_check = monitor.last_check_at + timedelta(
                    minutes=monitor.check_interval_minutes
                )
                if now >= next_check:
                    should_check = True

            if should_check:
                check_sitemap_task.delay(monitor.id)
                dispatched += 1
                logger.info("Dispatched sitemap check", monitor_id=monitor.id)

        return {"dispatched": dispatched, "total": len(monitors)}
