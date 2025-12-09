"""FastAPI 应用入口."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sitemap_monitor.config import get_settings
from sitemap_monitor.logging import configure_logging, get_logger
from sitemap_monitor.api import auth, monitors, changes, notifications, users, health, dashboard

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """应用生命周期管理."""
    # 启动时
    configure_logging()
    logger.info("Sitemap Monitor starting...")
    yield
    # 关闭时
    logger.info("Sitemap Monitor shutting down...")


def create_app() -> FastAPI:
    """创建 FastAPI 应用."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        description="Sitemap 变更监控系统 API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
    )

    # CORS 中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 注册路由
    app.include_router(health.router, tags=["health"])
    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
    app.include_router(monitors.router, prefix="/api/v1/monitors", tags=["monitors"])
    app.include_router(changes.router, prefix="/api/v1", tags=["changes"])
    app.include_router(
        notifications.router, prefix="/api/v1", tags=["notifications"]
    )
    app.include_router(
        dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"]
    )

    return app


app = create_app()
