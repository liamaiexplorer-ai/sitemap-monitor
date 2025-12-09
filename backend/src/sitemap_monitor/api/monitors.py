"""监控任务 API."""

from datetime import datetime

from fastapi import APIRouter, Query
from pydantic import BaseModel, HttpUrl, Field

from sitemap_monitor.api.deps import CurrentUser, DbSession
from sitemap_monitor.core.monitor_service import (
    create_monitor,
    delete_monitor,
    get_monitor_for_user,
    get_monitors,
    pause_monitor,
    resume_monitor,
    update_monitor,
    count_monitors,
)
from sitemap_monitor.core.validator import validate_sitemap_url
from sitemap_monitor.models import MonitorStatus

router = APIRouter()


# Request/Response 模型
class ValidateUrlRequest(BaseModel):
    """验证 URL 请求."""

    url: HttpUrl


class ValidateUrlResponse(BaseModel):
    """验证 URL 响应."""

    valid: bool
    is_index: bool = False
    url_count: int = 0
    child_sitemaps: int = 0
    error: str | None = None


class CreateMonitorRequest(BaseModel):
    """创建监控请求."""

    name: str = Field(..., min_length=1, max_length=255)
    sitemap_url: HttpUrl
    check_interval_minutes: int = Field(default=60, ge=1, le=1440)


class UpdateMonitorRequest(BaseModel):
    """更新监控请求."""

    name: str | None = Field(None, min_length=1, max_length=255)
    sitemap_url: HttpUrl | None = None
    check_interval_minutes: int | None = Field(None, ge=1, le=1440)


class MonitorResponse(BaseModel):
    """监控响应."""

    id: str
    name: str
    sitemap_url: str
    check_interval_minutes: int
    status: str
    last_check_at: datetime | None
    last_error: str | None
    error_count: int
    created_at: datetime
    updated_at: datetime


class MonitorListResponse(BaseModel):
    """监控列表响应."""

    items: list[MonitorResponse]
    total: int


class MessageResponse(BaseModel):
    """消息响应."""

    message: str


def _monitor_to_response(monitor) -> MonitorResponse:
    """转换监控任务为响应模型."""
    return MonitorResponse(
        id=monitor.id,
        name=monitor.name,
        sitemap_url=monitor.sitemap_url,
        check_interval_minutes=monitor.check_interval_minutes,
        status=monitor.status,
        last_check_at=monitor.last_check_at,
        last_error=monitor.last_error,
        error_count=monitor.error_count,
        created_at=monitor.created_at,
        updated_at=monitor.updated_at,
    )


@router.post("/validate-url", response_model=ValidateUrlResponse)
async def validate_url(request: ValidateUrlRequest):
    """验证 Sitemap URL."""
    result = await validate_sitemap_url(str(request.url))
    return ValidateUrlResponse(
        valid=result.valid,
        is_index=result.is_index,
        url_count=result.url_count,
        child_sitemaps=result.child_sitemaps,
        error=result.error,
    )


@router.post("", response_model=MonitorResponse)
async def create_monitor_task(
    request: CreateMonitorRequest,
    user: CurrentUser,
    db: DbSession,
):
    """创建监控任务."""
    from sitemap_monitor.tasks.scheduler import check_sitemap_task

    monitor = await create_monitor(
        db=db,
        user_id=user.id,
        name=request.name,
        sitemap_url=str(request.sitemap_url),
        check_interval_minutes=request.check_interval_minutes,
    )
    await db.commit()

    # 创建后立即触发首次检查
    check_sitemap_task.delay(monitor.id)

    return _monitor_to_response(monitor)


@router.get("", response_model=MonitorListResponse)
async def list_monitors(
    user: CurrentUser,
    db: DbSession,
    status: str | None = Query(None, description="筛选状态"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """获取监控任务列表."""
    status_enum = MonitorStatus(status) if status else None
    monitors = await get_monitors(db, user.id, status=status_enum, skip=skip, limit=limit)
    total = await count_monitors(db, user.id, status=status_enum)
    return MonitorListResponse(
        items=[_monitor_to_response(m) for m in monitors],
        total=total,
    )


@router.get("/{monitor_id}", response_model=MonitorResponse)
async def get_monitor_detail(
    monitor_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """获取监控任务详情."""
    monitor = await get_monitor_for_user(db, monitor_id, user.id)
    return _monitor_to_response(monitor)


@router.patch("/{monitor_id}", response_model=MonitorResponse)
async def update_monitor_task(
    monitor_id: str,
    request: UpdateMonitorRequest,
    user: CurrentUser,
    db: DbSession,
):
    """更新监控任务."""
    monitor = await get_monitor_for_user(db, monitor_id, user.id)
    monitor = await update_monitor(
        db=db,
        monitor=monitor,
        name=request.name,
        sitemap_url=str(request.sitemap_url) if request.sitemap_url else None,
        check_interval_minutes=request.check_interval_minutes,
    )
    return _monitor_to_response(monitor)


@router.delete("/{monitor_id}", response_model=MessageResponse)
async def delete_monitor_task(
    monitor_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """删除监控任务."""
    monitor = await get_monitor_for_user(db, monitor_id, user.id)
    await delete_monitor(db, monitor)
    return MessageResponse(message="监控任务已删除")


@router.post("/{monitor_id}/pause", response_model=MonitorResponse)
async def pause_monitor_task(
    monitor_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """暂停监控任务."""
    monitor = await get_monitor_for_user(db, monitor_id, user.id)
    monitor = await pause_monitor(db, monitor)
    return _monitor_to_response(monitor)


@router.post("/{monitor_id}/resume", response_model=MonitorResponse)
async def resume_monitor_task(
    monitor_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """恢复监控任务."""
    monitor = await get_monitor_for_user(db, monitor_id, user.id)
    monitor = await resume_monitor(db, monitor)
    return _monitor_to_response(monitor)


@router.post("/{monitor_id}/check", response_model=MessageResponse)
async def trigger_check(
    monitor_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """手动触发检查."""
    from sitemap_monitor.tasks.scheduler import check_sitemap_task

    monitor = await get_monitor_for_user(db, monitor_id, user.id)
    check_sitemap_task.delay(monitor.id)
    return MessageResponse(message="检查任务已提交")
