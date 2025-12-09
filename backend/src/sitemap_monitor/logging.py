"""结构化日志配置."""

import logging
import sys
from typing import Any

import structlog

from sitemap_monitor.config import get_settings


def configure_logging() -> None:
    """配置结构化日志."""
    settings = get_settings()

    # 设置 structlog 处理器
    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.UnicodeDecoder(),
    ]

    if settings.debug:
        # 开发环境：使用彩色控制台输出
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True)
        ]
    else:
        # 生产环境：使用 JSON 格式
        processors = shared_processors + [
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # 配置标准库日志
    log_level = logging.DEBUG if settings.debug else logging.INFO
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )

    # 调整第三方库日志级别
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """获取日志记录器."""
    return structlog.get_logger(name)
