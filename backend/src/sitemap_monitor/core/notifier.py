"""通知调度器."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from sitemap_monitor.logging import get_logger
from sitemap_monitor.models import (
    ChangeRecord,
    ChannelType,
    MonitorTask,
    MonitorTaskChannel,
    NotificationChannel,
    NotificationLog,
    NotificationStatus,
)
from sitemap_monitor.core.notifiers.email import send_email_notification
from sitemap_monitor.core.notifiers.webhook import send_webhook_notification

logger = get_logger(__name__)


async def notify_change(
    db: AsyncSession,
    change_record: ChangeRecord,
    monitor: MonitorTask,
) -> list[NotificationLog]:
    """
    发送变更通知.

    根据监控任务关联的通知渠道发送通知。

    Args:
        db: 数据库会话
        change_record: 变更记录
        monitor: 监控任务

    Returns:
        通知日志列表
    """
    # 获取监控任务关联的通知渠道
    result = await db.execute(
        select(NotificationChannel)
        .join(
            MonitorTaskChannel,
            NotificationChannel.id == MonitorTaskChannel.channel_id,
        )
        .where(
            MonitorTaskChannel.monitor_task_id == monitor.id,
            NotificationChannel.is_active == True,
        )
    )
    channels = result.scalars().all()

    if not channels:
        logger.info(
            "No notification channels configured",
            monitor_id=monitor.id,
        )
        return []

    logs = []
    for channel in channels:
        log = await _send_notification(db, channel, change_record, monitor)
        logs.append(log)

    return logs


async def _send_notification(
    db: AsyncSession,
    channel: NotificationChannel,
    change_record: ChangeRecord,
    monitor: MonitorTask,
) -> NotificationLog:
    """发送单个通知."""
    success = False
    error_message = None
    response_code = None

    try:
        if channel.channel_type == ChannelType.EMAIL.value:
            success, error_message = await send_email_notification(
                channel, change_record, monitor
            )
        elif channel.channel_type == ChannelType.WEBHOOK.value:
            success, error_message, response_code = await send_webhook_notification(
                channel, change_record, monitor
            )
        else:
            error_message = f"未知的通知渠道类型: {channel.channel_type}"
    except Exception as e:
        error_message = str(e)
        logger.error(
            "Notification send error",
            channel_id=channel.id,
            error=error_message,
        )

    # 创建通知日志
    log = NotificationLog(
        channel_id=channel.id,
        change_record_id=change_record.id,
        status=NotificationStatus.SENT.value if success else NotificationStatus.FAILED.value,
        error_message=error_message,
        response_code=response_code,
    )
    db.add(log)
    await db.flush()

    return log


async def test_channel(
    channel: NotificationChannel,
) -> tuple[bool, str | None]:
    """
    测试通知渠道.

    发送测试消息验证渠道配置是否正确。

    Args:
        channel: 通知渠道

    Returns:
        (是否成功, 错误信息)
    """
    # 创建测试数据
    class MockMonitor:
        id = "test"
        name = "测试监控"
        sitemap_url = "https://example.com/sitemap.xml"

    class MockChangeRecord:
        id = "test"
        change_type = "changed"
        added_count = 1
        removed_count = 0
        modified_count = 0
        created_at = __import__("datetime").datetime.now()
        changes = {
            "added": [{"url": "https://example.com/new-page"}],
            "removed": [],
            "modified": [],
        }

    try:
        if channel.channel_type == ChannelType.EMAIL.value:
            success, error = await send_email_notification(
                channel, MockChangeRecord(), MockMonitor()  # type: ignore
            )
            return success, error
        elif channel.channel_type == ChannelType.WEBHOOK.value:
            success, error, _ = await send_webhook_notification(
                channel, MockChangeRecord(), MockMonitor()  # type: ignore
            )
            return success, error
        else:
            return False, f"未知的通知渠道类型: {channel.channel_type}"
    except Exception as e:
        return False, str(e)
