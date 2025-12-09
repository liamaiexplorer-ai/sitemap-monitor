"""认证 API."""

from datetime import datetime, timezone

from fastapi import APIRouter, Cookie, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy import select

from sitemap_monitor.api.deps import DbSession
from sitemap_monitor.api.exceptions import BadRequestError, UnauthorizedError
from sitemap_monitor.config import get_settings
from sitemap_monitor.core.auth import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_password_reset_token,
    verify_token,
)
from sitemap_monitor.models import User

router = APIRouter()


# Request/Response 模型
class RegisterRequest(BaseModel):
    """注册请求."""

    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    """登录请求."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """令牌响应."""

    access_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    """密码重置请求."""

    email: EmailStr


class PasswordReset(BaseModel):
    """密码重置."""

    token: str
    new_password: str


class MessageResponse(BaseModel):
    """消息响应."""

    message: str


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, response: Response, db: DbSession):
    """用户注册."""
    # 检查邮箱是否已存在
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise BadRequestError("该邮箱已被注册")

    # 创建用户
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
    )
    db.add(user)
    await db.flush()

    # 生成令牌
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    # 设置 refresh token cookie
    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, response: Response, db: DbSession):
    """用户登录."""
    # 查找用户
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password_hash):
        raise UnauthorizedError("邮箱或密码错误")

    if not user.is_active:
        raise UnauthorizedError("账号已被禁用")

    # 更新最后登录时间
    user.last_login_at = datetime.now(timezone.utc)

    # 生成令牌
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    # 设置 refresh token cookie
    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return TokenResponse(access_token=access_token)


@router.post("/logout", response_model=MessageResponse)
async def logout(response: Response):
    """用户登出."""
    response.delete_cookie("refresh_token")
    return MessageResponse(message="已登出")


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    response: Response,
    db: DbSession,
    refresh_token: str | None = Cookie(default=None),
):
    """刷新访问令牌."""
    if not refresh_token:
        raise UnauthorizedError("缺少刷新令牌")

    user_id = verify_token(refresh_token, token_type="refresh")
    if not user_id:
        raise UnauthorizedError("刷新令牌无效或已过期")

    # 验证用户是否存在且活跃
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedError("用户不存在或已被禁用")

    # 生成新令牌
    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)

    # 更新 refresh token cookie
    settings = get_settings()
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.environment == "production",
        samesite="lax",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )

    return TokenResponse(access_token=new_access_token)


@router.post("/password/reset-request", response_model=MessageResponse)
async def password_reset_request(request: PasswordResetRequest, db: DbSession):
    """请求密码重置."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    # 无论用户是否存在，都返回相同的消息（安全考虑）
    if user:
        # 生成重置令牌
        token = create_password_reset_token(user.id)
        # TODO: 发送重置邮件
        # 在实际生产中，这里应该调用邮件发送服务
        _ = token  # 暂时忽略未使用的变量

    return MessageResponse(message="如果该邮箱已注册，您将收到密码重置邮件")


@router.post("/password/reset", response_model=MessageResponse)
async def password_reset(request: PasswordReset, db: DbSession):
    """重置密码."""
    user_id = verify_password_reset_token(request.token)
    if not user_id:
        raise BadRequestError("重置令牌无效或已过期")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise BadRequestError("用户不存在")

    # 更新密码
    user.password_hash = hash_password(request.new_password)

    return MessageResponse(message="密码已重置")
