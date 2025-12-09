"""用户模型."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from sitemap_monitor.models import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from sitemap_monitor.models.monitor import MonitorTask
    from sitemap_monitor.models.notification import NotificationChannel


class User(Base, UUIDMixin, TimestampMixin):
    """用户模型."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_completed_onboarding: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # 关系
    monitor_tasks: Mapped[list["MonitorTask"]] = relationship(
        "MonitorTask", back_populates="user", cascade="all, delete-orphan"
    )
    notification_channels: Mapped[list["NotificationChannel"]] = relationship(
        "NotificationChannel", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
