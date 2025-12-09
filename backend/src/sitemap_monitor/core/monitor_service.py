"""监控任务服务."""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sitemap_monitor.api.exceptions import ConflictError, NotFoundError, ForbiddenError
from sitemap_monitor.models import MonitorTask, MonitorStatus


async def create_monitor(
    db: AsyncSession,
    user_id: str,
    name: str,
    sitemap_url: str,
    check_interval_minutes: int = 60,
) -> MonitorTask:
    """创建监控任务."""
    # 检查是否已存在相同 URL 的监控
    result = await db.execute(
        select(MonitorTask).where(
            MonitorTask.user_id == user_id,
            MonitorTask.sitemap_url == sitemap_url,
        )
    )
    if result.scalar_one_or_none():
        raise ConflictError("该 Sitemap URL 已在监控中")

    monitor = MonitorTask(
        user_id=user_id,
        name=name,
        sitemap_url=sitemap_url,
        check_interval_minutes=check_interval_minutes,
        status=MonitorStatus.ACTIVE.value,
    )
    db.add(monitor)
    await db.flush()
    return monitor


async def get_monitors(
    db: AsyncSession,
    user_id: str,
    status: MonitorStatus | None = None,
    skip: int = 0,
    limit: int = 20,
) -> list[MonitorTask]:
    """获取用户的监控任务列表."""
    query = select(MonitorTask).where(MonitorTask.user_id == user_id)

    if status:
        query = query.where(MonitorTask.status == status.value)

    query = query.order_by(MonitorTask.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_monitor(db: AsyncSession, monitor_id: str) -> MonitorTask:
    """获取监控任务."""
    result = await db.execute(
        select(MonitorTask).where(MonitorTask.id == monitor_id)
    )
    monitor = result.scalar_one_or_none()
    if not monitor:
        raise NotFoundError("监控任务不存在")
    return monitor


async def get_monitor_for_user(
    db: AsyncSession, monitor_id: str, user_id: str
) -> MonitorTask:
    """获取用户的监控任务（带权限检查）."""
    monitor = await get_monitor(db, monitor_id)
    if monitor.user_id != user_id:
        raise ForbiddenError("无权访问此监控任务")
    return monitor


async def update_monitor(
    db: AsyncSession,
    monitor: MonitorTask,
    name: str | None = None,
    sitemap_url: str | None = None,
    check_interval_minutes: int | None = None,
) -> MonitorTask:
    """更新监控任务."""
    if name is not None:
        monitor.name = name
    if sitemap_url is not None:
        # 检查新 URL 是否与其他监控冲突
        if sitemap_url != monitor.sitemap_url:
            result = await db.execute(
                select(MonitorTask).where(
                    MonitorTask.user_id == monitor.user_id,
                    MonitorTask.sitemap_url == sitemap_url,
                    MonitorTask.id != monitor.id,
                )
            )
            if result.scalar_one_or_none():
                raise ConflictError("该 Sitemap URL 已在监控中")
        monitor.sitemap_url = sitemap_url
    if check_interval_minutes is not None:
        monitor.check_interval_minutes = check_interval_minutes

    return monitor


async def delete_monitor(db: AsyncSession, monitor: MonitorTask) -> None:
    """删除监控任务."""
    await db.delete(monitor)


async def pause_monitor(db: AsyncSession, monitor: MonitorTask) -> MonitorTask:
    """暂停监控任务."""
    monitor.status = MonitorStatus.PAUSED.value
    return monitor


async def resume_monitor(db: AsyncSession, monitor: MonitorTask) -> MonitorTask:
    """恢复监控任务."""
    monitor.status = MonitorStatus.ACTIVE.value
    monitor.error_count = 0
    monitor.last_error = None
    return monitor


async def mark_monitor_checked(
    db: AsyncSession,
    monitor: MonitorTask,
    success: bool = True,
    error: str | None = None,
) -> MonitorTask:
    """标记监控任务已检查."""
    monitor.last_check_at = datetime.now(timezone.utc)

    if success:
        monitor.error_count = 0
        monitor.last_error = None
    else:
        monitor.error_count += 1
        monitor.last_error = error
        # 连续 3 次失败后标记为错误状态
        if monitor.error_count >= 3:
            monitor.status = MonitorStatus.ERROR.value

    return monitor


async def count_monitors(
    db: AsyncSession, user_id: str, status: MonitorStatus | None = None
) -> int:
    """统计监控任务数量."""
    from sqlalchemy import func

    query = select(func.count(MonitorTask.id)).where(MonitorTask.user_id == user_id)
    if status:
        query = query.where(MonitorTask.status == status.value)

    result = await db.execute(query)
    return result.scalar_one()
