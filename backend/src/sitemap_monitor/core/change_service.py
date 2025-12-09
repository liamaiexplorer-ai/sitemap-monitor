"""变更记录服务."""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from sitemap_monitor.models import ChangeRecord, ChangeType


async def get_changes(
    db: AsyncSession,
    monitor_task_id: str,
    skip: int = 0,
    limit: int = 20,
    change_type: ChangeType | None = None,
) -> list[ChangeRecord]:
    """获取变更记录列表."""
    query = select(ChangeRecord).where(ChangeRecord.monitor_task_id == monitor_task_id)

    if change_type:
        query = query.where(ChangeRecord.change_type == change_type.value)

    query = query.order_by(ChangeRecord.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_change_by_id(
    db: AsyncSession, change_id: str
) -> ChangeRecord | None:
    """获取变更记录详情."""
    result = await db.execute(
        select(ChangeRecord).where(ChangeRecord.id == change_id)
    )
    return result.scalar_one_or_none()


async def count_changes(
    db: AsyncSession,
    monitor_task_id: str,
    change_type: ChangeType | None = None,
) -> int:
    """统计变更记录数量."""
    query = select(func.count(ChangeRecord.id)).where(
        ChangeRecord.monitor_task_id == monitor_task_id
    )

    if change_type:
        query = query.where(ChangeRecord.change_type == change_type.value)

    result = await db.execute(query)
    return result.scalar_one()


async def get_recent_changes_count(
    db: AsyncSession, user_id: str, days: int = 1
) -> int:
    """获取用户最近的变更数量."""
    from datetime import datetime, timedelta, timezone
    from sitemap_monitor.models import MonitorTask

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    query = (
        select(func.count(ChangeRecord.id))
        .join(MonitorTask, ChangeRecord.monitor_task_id == MonitorTask.id)
        .where(
            MonitorTask.user_id == user_id,
            ChangeRecord.change_type == ChangeType.CHANGED.value,
            ChangeRecord.created_at >= cutoff,
        )
    )

    result = await db.execute(query)
    return result.scalar_one()
