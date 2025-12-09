"""应用配置管理."""

from functools import lru_cache
from typing import Literal

from pydantic import EmailStr, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # 应用配置
    app_name: str = "Sitemap Monitor"
    debug: bool = False
    environment: Literal["development", "production", "testing"] = "development"

    # 数据库配置
    database_url: PostgresDsn = "postgresql+asyncpg://postgres:postgres@localhost:5432/sitemap_monitor"  # type: ignore

    # Redis 配置
    redis_url: RedisDsn = "redis://localhost:6379/0"  # type: ignore

    # JWT 配置
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # SMTP 配置
    smtp_host: str = "smtp.example.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: EmailStr = "noreply@example.com"  # type: ignore
    smtp_use_tls: bool = True

    # Sitemap 检查配置
    sitemap_request_timeout: int = 30
    sitemap_max_retries: int = 3
    sitemap_retry_delay: int = 60

    # 数据保留配置
    snapshot_retention_days: int = 90
    notification_log_retention_days: int = 30

    # CORS 配置
    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    """获取配置单例."""
    return Settings()
