"""认证服务."""

import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt

from sitemap_monitor.config import get_settings


def hash_password(password: str) -> str:
    """哈希密码."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def create_access_token(user_id: str, expires_delta: timedelta | None = None) -> str:
    """创建访问令牌."""
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode: dict[str, Any] = {
        "sub": user_id,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def create_refresh_token(user_id: str, expires_delta: timedelta | None = None) -> str:
    """创建刷新令牌."""
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(days=settings.refresh_token_expire_days)

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode: dict[str, Any] = {
        "sub": user_id,
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def verify_token(token: str, token_type: str = "access") -> str | None:
    """验证令牌并返回用户 ID."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id: str | None = payload.get("sub")
        payload_type: str | None = payload.get("type")

        if user_id is None or payload_type != token_type:
            return None

        return user_id
    except jwt.JWTError:
        return None


def create_password_reset_token(user_id: str) -> str:
    """创建密码重置令牌（1小时过期）."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    to_encode: dict[str, Any] = {
        "sub": user_id,
        "type": "password_reset",
        "exp": expire,
    }
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def verify_password_reset_token(token: str) -> str | None:
    """验证密码重置令牌."""
    return verify_token(token, token_type="password_reset")
