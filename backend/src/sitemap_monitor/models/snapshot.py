"""快照和变更记录模型."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sitemap_monitor.models import Base, UUIDMixin

if TYPE_CHECKING:
    from sitemap_monitor.models.monitor import MonitorTask
    from sitemap_monitor.models.notification import NotificationLog


class ChangeType(str, Enum):
    """变更类型."""

    INITIAL = "initial"
    NO_CHANGE = "no_change"
    CHANGED = "changed"


class SitemapSnapshot(Base, UUIDMixin):
    """Sitemap 快照模型."""

    __tablename__ = "sitemap_snapshots"

    monitor_task_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("monitor_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    url_count: Mapped[int] = mapped_column(Integer, nullable=False)
    url_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    urls: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    fetch_duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    parse_duration_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    # 关系
    monitor_task: Mapped["MonitorTask"] = relationship(
        "MonitorTask", back_populates="snapshots"
    )

    def __repr__(self) -> str:
        return f"<SitemapSnapshot {self.id} ({self.url_count} URLs)>"


class ChangeRecord(Base, UUIDMixin):
    """变更记录模型."""

    __tablename__ = "change_records"

    monitor_task_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("monitor_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    old_snapshot_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("sitemap_snapshots.id", ondelete="SET NULL"),
        nullable=True,
    )
    new_snapshot_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("sitemap_snapshots.id", ondelete="CASCADE"),
        nullable=False,
    )
    change_type: Mapped[ChangeType] = mapped_column(String(20), nullable=False)
    added_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    removed_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    modified_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    changes: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    # 关系
    monitor_task: Mapped["MonitorTask"] = relationship(
        "MonitorTask", back_populates="change_records"
    )
    old_snapshot: Mapped["SitemapSnapshot | None"] = relationship(
        "SitemapSnapshot", foreign_keys=[old_snapshot_id]
    )
    new_snapshot: Mapped["SitemapSnapshot"] = relationship(
        "SitemapSnapshot", foreign_keys=[new_snapshot_id]
    )
    notification_logs: Mapped[list["NotificationLog"]] = relationship(
        "NotificationLog", back_populates="change_record"
    )

    def __repr__(self) -> str:
        return f"<ChangeRecord {self.id} ({self.change_type})>"
