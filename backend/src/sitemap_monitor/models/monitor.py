"""监控任务模型."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sitemap_monitor.models import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from sitemap_monitor.models.user import User
    from sitemap_monitor.models.snapshot import SitemapSnapshot, ChangeRecord
    from sitemap_monitor.models.notification import MonitorTaskChannel


class MonitorStatus(str, Enum):
    """监控任务状态."""

    ACTIVE = "active"
    PAUSED = "paused"
    ERROR = "error"


class MonitorTask(Base, UUIDMixin, TimestampMixin):
    """监控任务模型."""

    __tablename__ = "monitor_tasks"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sitemap_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    check_interval_minutes: Mapped[int] = mapped_column(
        Integer, default=60, nullable=False
    )
    status: Mapped[MonitorStatus] = mapped_column(
        String(20), default=MonitorStatus.ACTIVE.value, nullable=False, index=True
    )
    last_check_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # 关系
    user: Mapped["User"] = relationship("User", back_populates="monitor_tasks")
    snapshots: Mapped[list["SitemapSnapshot"]] = relationship(
        "SitemapSnapshot", back_populates="monitor_task", cascade="all, delete-orphan"
    )
    change_records: Mapped[list["ChangeRecord"]] = relationship(
        "ChangeRecord", back_populates="monitor_task", cascade="all, delete-orphan"
    )
    task_channels: Mapped[list["MonitorTaskChannel"]] = relationship(
        "MonitorTaskChannel", back_populates="monitor_task", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<MonitorTask {self.name}>"
