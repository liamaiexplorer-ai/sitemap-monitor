"""API 依赖项."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sitemap_monitor.config import get_settings
from sitemap_monitor.models import get_db, User

security = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User | None:
    """获取当前用户（可选）."""
    if not credentials:
        return None

    settings = get_settings()
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=["HS256"],
        )
        user_id: str | None = payload.get("sub")
        token_type: str | None = payload.get("type")

        if user_id is None or token_type != "access":
            return None

    except JWTError:
        return None

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        return None

    return user


async def get_current_user(
    user: Annotated[User | None, Depends(get_current_user_optional)],
) -> User:
    """获取当前用户（必须）."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未认证或令牌无效",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


# 类型别名
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[User | None, Depends(get_current_user_optional)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
