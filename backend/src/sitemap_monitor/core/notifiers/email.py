"""邮件通知器."""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sitemap_monitor.config import get_settings
from sitemap_monitor.logging import get_logger
from sitemap_monitor.models import ChangeRecord, MonitorTask, NotificationChannel

logger = get_logger(__name__)


async def send_email_notification(
    channel: NotificationChannel,
    change_record: ChangeRecord,
    monitor: MonitorTask,
) -> tuple[bool, str | None]:
    """
    发送邮件通知.

    Args:
        channel: 通知渠道
        change_record: 变更记录
        monitor: 监控任务

    Returns:
        (是否成功, 错误信息)
    """
    settings = get_settings()
    config = channel.config

    to_email = config.get("email")
    if not to_email:
        return False, "邮箱地址未配置"

    # 构建邮件内容
    subject = f"[Sitemap Monitor] {monitor.name} 检测到变更"

    changes = change_record.changes
    body = f"""
Sitemap 监控任务「{monitor.name}」检测到变更。

监控 URL: {monitor.sitemap_url}
检测时间: {change_record.created_at.strftime('%Y-%m-%d %H:%M:%S')}

变更摘要:
- 新增 URL: {change_record.added_count} 个
- 删除 URL: {change_record.removed_count} 个
- 修改 URL: {change_record.modified_count} 个

"""

    if changes.get("added"):
        body += "\n新增的 URL:\n"
        for item in changes["added"][:10]:
            body += f"  - {item['url']}\n"
        if len(changes["added"]) > 10:
            body += f"  ... 还有 {len(changes['added']) - 10} 个\n"

    if changes.get("removed"):
        body += "\n删除的 URL:\n"
        for item in changes["removed"][:10]:
            body += f"  - {item['url']}\n"
        if len(changes["removed"]) > 10:
            body += f"  ... 还有 {len(changes['removed']) - 10} 个\n"

    if changes.get("modified"):
        body += "\n修改的 URL:\n"
        for item in changes["modified"][:10]:
            body += f"  - {item['url']} (lastmod: {item.get('old_lastmod')} -> {item.get('new_lastmod')})\n"
        if len(changes["modified"]) > 10:
            body += f"  ... 还有 {len(changes['modified']) - 10} 个\n"

    body += "\n\n---\nSitemap Monitor - 您的网站变更监控助手"

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.smtp_from_email
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain", "utf-8"))

        # 发送邮件
        if settings.smtp_use_tls:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)

        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)

        server.send_message(msg)
        server.quit()

        logger.info(
            "Email notification sent",
            to=to_email,
            monitor_id=monitor.id,
            change_id=change_record.id,
        )
        return True, None

    except Exception as e:
        error_msg = str(e)
        logger.error(
            "Email notification failed",
            to=to_email,
            error=error_msg,
        )
        return False, error_msg
