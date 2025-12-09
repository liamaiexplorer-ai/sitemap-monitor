"""用户 API."""

from datetime import datetime

from pydantic import BaseModel

from fastapi import APIRouter

from sitemap_monitor.api.deps import CurrentUser, DbSession
from sitemap_monitor.api.exceptions import BadRequestError
from sitemap_monitor.core.auth import hash_password, verify_password

router = APIRouter()


class UserResponse(BaseModel):
    """用户响应."""

    id: str
    email: str
    is_active: bool
    is_verified: bool
    has_completed_onboarding: bool
    created_at: datetime
    last_login_at: datetime | None


class ChangePasswordRequest(BaseModel):
    """修改密码请求."""

    current_password: str
    new_password: str


class MessageResponse(BaseModel):
    """消息响应."""

    message: str


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(user: CurrentUser):
    """获取当前用户信息."""
    return UserResponse(
        id=user.id,
        email=user.email,
        is_active=user.is_active,
        is_verified=user.is_verified,
        has_completed_onboarding=user.has_completed_onboarding,
        created_at=user.created_at,
        last_login_at=user.last_login_at,
    )


@router.put("/me/password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest, user: CurrentUser, db: DbSession
):
    """修改密码."""
    if not verify_password(request.current_password, user.password_hash):
        raise BadRequestError("当前密码错误")

    user.password_hash = hash_password(request.new_password)
    return MessageResponse(message="密码已修改")


@router.post("/me/onboarding", response_model=MessageResponse)
async def complete_onboarding(user: CurrentUser, db: DbSession):
    """完成新手引导."""
    user.has_completed_onboarding = True
    return MessageResponse(message="引导已完成")
