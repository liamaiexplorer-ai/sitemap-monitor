"""仪表盘 API."""

from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from sitemap_monitor.api.deps import CurrentUser, DbSession
from sitemap_monitor.core.monitor_service import count_monitors
from sitemap_monitor.core.notification_service import count_channels
from sitemap_monitor.core.change_service import get_recent_changes_count
from sitemap_monitor.models import MonitorStatus

router = APIRouter()


class RecentChangeItem(BaseModel):
    """最近变更项."""

    id: str
    monitor_task_id: str
    monitor_name: str
    added_count: int
    removed_count: int
    modified_count: int
    created_at: datetime


class DashboardStatsResponse(BaseModel):
    """仪表盘统计响应."""

    active_monitors: int
    today_changes: int
    notification_channels: int
    recent_changes: list[RecentChangeItem]


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    user: CurrentUser,
    db: DbSession,
):
    """获取仪表盘统计数据."""
    from sqlalchemy import select
    from sitemap_monitor.models import ChangeRecord, MonitorTask, ChangeType

    # 统计活跃监控数
    active_monitors = await count_monitors(db, user.id, status=MonitorStatus.ACTIVE)

    # 统计今日变更数
    today_changes = await get_recent_changes_count(db, user.id, days=1)

    # 统计通知渠道数
    notification_channels = await count_channels(db, user.id)

    # 获取最近变更（最多5条）
    result = await db.execute(
        select(ChangeRecord, MonitorTask.name)
        .join(MonitorTask, ChangeRecord.monitor_task_id == MonitorTask.id)
        .where(
            MonitorTask.user_id == user.id,
            ChangeRecord.change_type == ChangeType.CHANGED.value,
        )
        .order_by(ChangeRecord.created_at.desc())
        .limit(5)
    )
    rows = result.all()

    recent_changes = [
        RecentChangeItem(
            id=record.id,
            monitor_task_id=record.monitor_task_id,
            monitor_name=monitor_name,
            added_count=record.added_count,
            removed_count=record.removed_count,
            modified_count=record.modified_count,
            created_at=record.created_at,
        )
        for record, monitor_name in rows
    ]

    return DashboardStatsResponse(
        active_monitors=active_monitors,
        today_changes=today_changes,
        notification_channels=notification_channels,
        recent_changes=recent_changes,
    )
