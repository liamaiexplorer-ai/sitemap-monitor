"""通知相关模型."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sitemap_monitor.models import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from sitemap_monitor.models.user import User
    from sitemap_monitor.models.monitor import MonitorTask
    from sitemap_monitor.models.snapshot import ChangeRecord


class ChannelType(str, Enum):
    """通知渠道类型."""

    EMAIL = "email"
    WEBHOOK = "webhook"


class NotificationStatus(str, Enum):
    """通知状态."""

    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class NotificationChannel(Base, UUIDMixin, TimestampMixin):
    """通知渠道模型."""

    __tablename__ = "notification_channels"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    channel_type: Mapped[ChannelType] = mapped_column(String(20), nullable=False)
    config: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_test_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_test_success: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    # 关系
    user: Mapped["User"] = relationship("User", back_populates="notification_channels")
    task_channels: Mapped[list["MonitorTaskChannel"]] = relationship(
        "MonitorTaskChannel", back_populates="channel", cascade="all, delete-orphan"
    )
    notification_logs: Mapped[list["NotificationLog"]] = relationship(
        "NotificationLog", back_populates="channel", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<NotificationChannel {self.name} ({self.channel_type})>"


class MonitorTaskChannel(Base):
    """监控任务-通知渠道关联模型."""

    __tablename__ = "monitor_task_channels"

    monitor_task_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("monitor_tasks.id", ondelete="CASCADE"),
        primary_key=True,
    )
    channel_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notification_channels.id", ondelete="CASCADE"),
        primary_key=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # 关系
    monitor_task: Mapped["MonitorTask"] = relationship(
        "MonitorTask", back_populates="task_channels"
    )
    channel: Mapped["NotificationChannel"] = relationship(
        "NotificationChannel", back_populates="task_channels"
    )


class NotificationLog(Base, UUIDMixin):
    """通知日志模型."""

    __tablename__ = "notification_logs"

    channel_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("notification_channels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    change_record_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("change_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[NotificationStatus] = mapped_column(
        String(20), nullable=False, index=True
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    response_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # 关系
    channel: Mapped["NotificationChannel"] = relationship(
        "NotificationChannel", back_populates="notification_logs"
    )
    change_record: Mapped["ChangeRecord"] = relationship(
        "ChangeRecord", back_populates="notification_logs"
    )

    def __repr__(self) -> str:
        return f"<NotificationLog {self.id} ({self.status})>"
