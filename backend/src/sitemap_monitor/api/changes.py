"""变更历史 API."""

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Query
from pydantic import BaseModel

from sitemap_monitor.api.deps import CurrentUser, DbSession
from sitemap_monitor.api.exceptions import NotFoundError, ForbiddenError
from sitemap_monitor.core.change_service import get_changes, get_change_by_id, count_changes
from sitemap_monitor.core.monitor_service import get_monitor, get_monitor_for_user

router = APIRouter()


class ChangeResponse(BaseModel):
    """变更响应."""

    id: str
    monitor_task_id: str
    change_type: str
    added_count: int
    removed_count: int
    modified_count: int
    created_at: datetime


class ChangeDetailResponse(ChangeResponse):
    """变更详情响应."""

    changes: dict[str, Any]


class ChangeListResponse(BaseModel):
    """变更列表响应."""

    items: list[ChangeResponse]
    total: int


def _change_to_response(change) -> ChangeResponse:
    """转换变更记录为响应模型."""
    return ChangeResponse(
        id=change.id,
        monitor_task_id=change.monitor_task_id,
        change_type=change.change_type,
        added_count=change.added_count,
        removed_count=change.removed_count,
        modified_count=change.modified_count,
        created_at=change.created_at,
    )


@router.get("/monitors/{monitor_id}/changes", response_model=ChangeListResponse)
async def list_changes(
    monitor_id: str,
    user: CurrentUser,
    db: DbSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """获取变更历史列表."""
    # 验证权限
    await get_monitor_for_user(db, monitor_id, user.id)

    changes = await get_changes(db, monitor_id, skip=skip, limit=limit)
    total = await count_changes(db, monitor_id)

    return ChangeListResponse(
        items=[_change_to_response(c) for c in changes],
        total=total,
    )


@router.get("/monitors/{monitor_id}/changes/{change_id}", response_model=ChangeDetailResponse)
async def get_change_detail(
    monitor_id: str,
    change_id: str,
    user: CurrentUser,
    db: DbSession,
):
    """获取变更详情."""
    # 验证权限
    await get_monitor_for_user(db, monitor_id, user.id)

    change = await get_change_by_id(db, change_id)
    if not change:
        raise NotFoundError("变更记录不存在")

    if change.monitor_task_id != monitor_id:
        raise ForbiddenError("无权访问此变更记录")

    return ChangeDetailResponse(
        id=change.id,
        monitor_task_id=change.monitor_task_id,
        change_type=change.change_type,
        added_count=change.added_count,
        removed_count=change.removed_count,
        modified_count=change.modified_count,
        created_at=change.created_at,
        changes=change.changes,
    )
