"""Webhook 通知器."""

import httpx

from sitemap_monitor.config import get_settings
from sitemap_monitor.logging import get_logger
from sitemap_monitor.models import ChangeRecord, MonitorTask, NotificationChannel

logger = get_logger(__name__)


async def send_webhook_notification(
    channel: NotificationChannel,
    change_record: ChangeRecord,
    monitor: MonitorTask,
) -> tuple[bool, str | None, int | None]:
    """
    发送 Webhook 通知.

    Args:
        channel: 通知渠道
        change_record: 变更记录
        monitor: 监控任务

    Returns:
        (是否成功, 错误信息, HTTP 状态码)
    """
    settings = get_settings()
    config = channel.config

    webhook_url = config.get("url")
    if not webhook_url:
        return False, "Webhook URL 未配置", None

    headers = config.get("headers", {})
    method = config.get("method", "POST").upper()

    # 构建 payload
    payload = {
        "event": "sitemap_change",
        "monitor": {
            "id": monitor.id,
            "name": monitor.name,
            "sitemap_url": monitor.sitemap_url,
        },
        "change": {
            "id": change_record.id,
            "type": change_record.change_type,
            "added_count": change_record.added_count,
            "removed_count": change_record.removed_count,
            "modified_count": change_record.modified_count,
            "created_at": change_record.created_at.isoformat(),
        },
        "details": change_record.changes,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            if method == "POST":
                response = await client.post(
                    webhook_url, json=payload, headers=headers
                )
            elif method == "PUT":
                response = await client.put(
                    webhook_url, json=payload, headers=headers
                )
            else:
                return False, f"不支持的 HTTP 方法: {method}", None

            status_code = response.status_code

            if 200 <= status_code < 300:
                logger.info(
                    "Webhook notification sent",
                    url=webhook_url,
                    status_code=status_code,
                    monitor_id=monitor.id,
                )
                return True, None, status_code
            else:
                error_msg = f"HTTP {status_code}: {response.text[:200]}"
                logger.warning(
                    "Webhook notification failed",
                    url=webhook_url,
                    status_code=status_code,
                    error=error_msg,
                )
                return False, error_msg, status_code

    except httpx.TimeoutException:
        logger.error("Webhook notification timeout", url=webhook_url)
        return False, "请求超时", None
    except Exception as e:
        error_msg = str(e)
        logger.error(
            "Webhook notification error",
            url=webhook_url,
            error=error_msg,
        )
        return False, error_msg, None
