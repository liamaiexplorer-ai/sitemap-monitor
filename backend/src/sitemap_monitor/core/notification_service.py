"""通知渠道服务."""

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sitemap_monitor.api.exceptions import NotFoundError, ForbiddenError, ConflictError
from sitemap_monitor.models import NotificationChannel, ChannelType, MonitorTaskChannel


async def create_channel(
    db: AsyncSession,
    user_id: str,
    name: str,
    channel_type: ChannelType,
    config: dict[str, Any],
) -> NotificationChannel:
    """创建通知渠道."""
    channel = NotificationChannel(
        user_id=user_id,
        name=name,
        channel_type=channel_type.value,
        config=config,
    )
    db.add(channel)
    await db.flush()
    return channel


async def get_channels(
    db: AsyncSession,
    user_id: str,
    skip: int = 0,
    limit: int = 20,
) -> list[NotificationChannel]:
    """获取通知渠道列表."""
    result = await db.execute(
        select(NotificationChannel)
        .where(NotificationChannel.user_id == user_id)
        .order_by(NotificationChannel.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_channel(db: AsyncSession, channel_id: str) -> NotificationChannel:
    """获取通知渠道."""
    result = await db.execute(
        select(NotificationChannel).where(NotificationChannel.id == channel_id)
    )
    channel = result.scalar_one_or_none()
    if not channel:
        raise NotFoundError("通知渠道不存在")
    return channel


async def get_channel_for_user(
    db: AsyncSession, channel_id: str, user_id: str
) -> NotificationChannel:
    """获取用户的通知渠道（带权限检查）."""
    channel = await get_channel(db, channel_id)
    if channel.user_id != user_id:
        raise ForbiddenError("无权访问此通知渠道")
    return channel


async def update_channel(
    db: AsyncSession,
    channel: NotificationChannel,
    name: str | None = None,
    config: dict[str, Any] | None = None,
    is_active: bool | None = None,
) -> NotificationChannel:
    """更新通知渠道."""
    if name is not None:
        channel.name = name
    if config is not None:
        channel.config = config
    if is_active is not None:
        channel.is_active = is_active
    return channel


async def delete_channel(db: AsyncSession, channel: NotificationChannel) -> None:
    """删除通知渠道."""
    await db.delete(channel)


async def update_test_result(
    db: AsyncSession,
    channel: NotificationChannel,
    success: bool,
) -> NotificationChannel:
    """更新测试结果."""
    channel.last_test_at = datetime.now(timezone.utc)
    channel.last_test_success = success
    return channel


async def get_monitor_channels(
    db: AsyncSession, monitor_task_id: str
) -> list[str]:
    """获取监控任务关联的通知渠道 ID 列表."""
    result = await db.execute(
        select(MonitorTaskChannel.channel_id).where(
            MonitorTaskChannel.monitor_task_id == monitor_task_id
        )
    )
    return [row[0] for row in result.all()]


async def set_monitor_channels(
    db: AsyncSession,
    monitor_task_id: str,
    user_id: str,
    channel_ids: list[str],
) -> None:
    """设置监控任务的通知渠道."""
    # 验证所有渠道都属于该用户
    for channel_id in channel_ids:
        await get_channel_for_user(db, channel_id, user_id)

    # 删除现有关联
    result = await db.execute(
        select(MonitorTaskChannel).where(
            MonitorTaskChannel.monitor_task_id == monitor_task_id
        )
    )
    for assoc in result.scalars().all():
        await db.delete(assoc)

    # 创建新关联
    for channel_id in channel_ids:
        assoc = MonitorTaskChannel(
            monitor_task_id=monitor_task_id,
            channel_id=channel_id,
        )
        db.add(assoc)


async def count_channels(db: AsyncSession, user_id: str) -> int:
    """统计通知渠道数量."""
    from sqlalchemy import func

    result = await db.execute(
        select(func.count(NotificationChannel.id)).where(
            NotificationChannel.user_id == user_id
        )
    )
    return result.scalar_one()
