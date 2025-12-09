"""通知渠道 API."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Query
from pydantic import BaseModel

from sitemap_monitor.api.deps import CurrentUser, DbSession
from sitemap_monitor.core.notification_service import (
    create_channel,
    delete_channel,
    get_channel_for_user,
    get_channels,
    update_channel,
    update_test_result,
    get_monitor_channels,
    set_monitor_channels,
    count_channels,
)
from sitemap_monitor.core.monitor_service import get_monitor_for_user
from sitemap_monitor.core.notifier import test_channel
from sitemap_monitor.models import ChannelType

router = APIRouter()


class CreateChannelRequest(BaseModel):
    """创建通知渠道请求."""

    name: str
    channel_type: str  # "email" or "webhook"
    config: dict[str, Any]


class UpdateChannelRequest(BaseModel):
    """更新通知渠道请求."""

    name: str | None = None
    config: dict[str, Any] | None = None
    is_active: bool | None = None


class ChannelResponse(BaseModel):
    """通知渠道响应."""

    id: str
    name: str
    channel_type: str
    config: dict[str, Any]
    is_active: bool
    last_test_at: datetime | None
    last_test_success: bool | None
    created_at: datetime


class ChannelListResponse(BaseModel):
    """通知渠道列表响应."""

    items: list[ChannelResponse]
    total: int


class MessageResponse(BaseModel):
    """消息响应."""

    message: str


class TestResultResponse(BaseModel):
    """测试结果响应."""

    success: bool
    error: str | None = None


class MonitorChannelsRequest(BaseModel):
    """设置监控渠道请求."""

    channel_ids: list[str]


class MonitorChannelsResponse(BaseModel):
    """监控渠道响应."""

    channel_ids: list[str]


def _channel_to_response(channel) -> ChannelResponse:
    """转换通知渠道为响应模型."""
    return ChannelResponse(
        id=channel.id,
        name=channel.name,
        channel_type=channel.channel_type,
        config=channel.config,
        is_active=channel.is_active,
        last_test_at=channel.last_test_at,
        last_test_success=channel.last_test_success,
        created_at=channel.created_at,
    )


@router.post("/notification-channels", response_model=ChannelResponse)
async def create_notification_channel(
    request: CreateChannelRequest,
    user: CurrentUser,
    db: DbSession,
):
    """创建通知渠道."""
    channel_type = ChannelType(request.channel_type)
    channel = await create_channel(
        db=db,
        user_id=user.id,
        name=request.name,
        channel_type=channel_type,
        config=request.config,
    )
    return _channel_to_response(channel)


@router.get("/notification-channels", response_model=ChannelListResponse)
async def list_notification_channels(
    user: CurrentUser,
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """获取通知渠道列表."""
    channels = await get_channels(db, user.id, skip=skip, limit=limit)
    total = await count_channels(db, user.id)
    return ChannelListResponse(
        items=[_channel_to_response(c) for c in channels],
        total=total,
    )


@router.get("/notification-channels/{channel_id}", response_model=ChannelResponse)
async def get_notification_channel(
    channel_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """获取通知渠道详情."""
    channel = await get_channel_for_user(db, channel_id, user.id)
    return _channel_to_response(channel)


@router.patch("/notification-channels/{channel_id}", response_model=ChannelResponse)
async def update_notification_channel(
    channel_id: str,
    request: UpdateChannelRequest,
    user: CurrentUser,
    db: DbSession,
):
    """更新通知渠道."""
    channel = await get_channel_for_user(db, channel_id, user.id)
    channel = await update_channel(
        db=db,
        channel=channel,
        name=request.name,
        config=request.config,
        is_active=request.is_active,
    )
    return _channel_to_response(channel)


@router.delete("/notification-channels/{channel_id}", response_model=MessageResponse)
async def delete_notification_channel(
    channel_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """删除通知渠道."""
    channel = await get_channel_for_user(db, channel_id, user.id)
    await delete_channel(db, channel)
    return MessageResponse(message="通知渠道已删除")


@router.post("/notification-channels/{channel_id}/test", response_model=TestResultResponse)
async def test_notification_channel(
    channel_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """测试通知渠道."""
    channel = await get_channel_for_user(db, channel_id, user.id)
    success, error = await test_channel(channel)
    await update_test_result(db, channel, success)
    return TestResultResponse(success=success, error=error)


@router.get("/monitors/{monitor_id}/channels", response_model=MonitorChannelsResponse)
async def get_monitor_notification_channels(
    monitor_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """获取监控任务的通知渠道."""
    await get_monitor_for_user(db, monitor_id, user.id)
    channel_ids = await get_monitor_channels(db, monitor_id)
    return MonitorChannelsResponse(channel_ids=channel_ids)


@router.put("/monitors/{monitor_id}/channels", response_model=MonitorChannelsResponse)
async def set_monitor_notification_channels(
    monitor_id: str,
    request: MonitorChannelsRequest,
    user: CurrentUser,
    db: DbSession,
):
    """设置监控任务的通知渠道."""
    await get_monitor_for_user(db, monitor_id, user.id)
    await set_monitor_channels(db, monitor_id, user.id, request.channel_ids)
    return MonitorChannelsResponse(channel_ids=request.channel_ids)
