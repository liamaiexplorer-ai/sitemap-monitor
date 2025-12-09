"""数据模型模块."""

from datetime import datetime
from typing import AsyncGenerator
from uuid import uuid4

from sqlalchemy import DateTime, String, func
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from sitemap_monitor.config import get_settings


class Base(DeclarativeBase):
    """SQLAlchemy 基类."""

    pass


class TimestampMixin:
    """时间戳混入类."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """UUID 主键混入类."""

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid4()),
    )


# 数据库引擎工厂函数
def create_engine():
    """创建新的数据库引擎（每次调用创建新实例，适用于 Celery 任务）."""
    settings = get_settings()
    return create_async_engine(
        str(settings.database_url),
        echo=settings.debug,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )


def create_session_factory(engine=None) -> async_sessionmaker[AsyncSession]:
    """创建会话工厂."""
    if engine is None:
        engine = create_engine()
    return async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


# FastAPI 使用的单例（在主进程中复用）
_api_engine = None
_api_session_factory = None


def get_engine():
    """获取 API 使用的数据库引擎（单例，仅用于 FastAPI）."""
    global _api_engine
    if _api_engine is None:
        _api_engine = create_engine()
    return _api_engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """获取 API 使用的会话工厂（单例，仅用于 FastAPI）."""
    global _api_session_factory
    if _api_session_factory is None:
        _api_session_factory = create_session_factory(get_engine())
    return _api_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """获取数据库会话（用于依赖注入）."""
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# 导出模型
from sitemap_monitor.models.user import User
from sitemap_monitor.models.monitor import MonitorTask, MonitorStatus
from sitemap_monitor.models.snapshot import SitemapSnapshot, ChangeRecord, ChangeType
from sitemap_monitor.models.notification import (
    NotificationChannel,
    ChannelType,
    MonitorTaskChannel,
    NotificationLog,
    NotificationStatus,
)

__all__ = [
    "Base",
    "TimestampMixin",
    "UUIDMixin",
    "get_db",
    "get_engine",
    "get_session_factory",
    "create_engine",
    "create_session_factory",
    "User",
    "MonitorTask",
    "MonitorStatus",
    "SitemapSnapshot",
    "ChangeRecord",
    "ChangeType",
    "NotificationChannel",
    "ChannelType",
    "MonitorTaskChannel",
    "NotificationLog",
    "NotificationStatus",
]
