"""快照服务."""

import hashlib
import json
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sitemap_monitor.models import SitemapSnapshot, ChangeRecord, ChangeType
from sitemap_monitor.core.differ import compare_snapshots, ChangeResult


def compute_url_hash(urls: list[dict[str, Any]]) -> str:
    """计算 URL 列表的哈希值."""
    # 只用 URL 字符串排序后计算哈希
    url_list = sorted([item["url"] for item in urls])
    content = json.dumps(url_list, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()


async def create_snapshot(
    db: AsyncSession,
    monitor_task_id: str,
    urls: list[dict[str, Any]],
    fetch_duration_ms: int,
    parse_duration_ms: int,
) -> SitemapSnapshot:
    """创建快照."""
    url_hash = compute_url_hash(urls)

    snapshot = SitemapSnapshot(
        monitor_task_id=monitor_task_id,
        url_count=len(urls),
        url_hash=url_hash,
        urls=urls,
        fetch_duration_ms=fetch_duration_ms,
        parse_duration_ms=parse_duration_ms,
    )
    db.add(snapshot)
    await db.flush()
    return snapshot


async def get_latest_snapshot(
    db: AsyncSession, monitor_task_id: str
) -> SitemapSnapshot | None:
    """获取最新快照."""
    result = await db.execute(
        select(SitemapSnapshot)
        .where(SitemapSnapshot.monitor_task_id == monitor_task_id)
        .order_by(SitemapSnapshot.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def compare_with_previous(
    db: AsyncSession,
    monitor_task_id: str,
    new_snapshot: SitemapSnapshot,
) -> tuple[ChangeResult, SitemapSnapshot | None]:
    """
    与上一个快照比较.

    Returns:
        (变更结果, 旧快照)
    """
    # 获取上一个快照（不包括当前快照）
    result = await db.execute(
        select(SitemapSnapshot)
        .where(
            SitemapSnapshot.monitor_task_id == monitor_task_id,
            SitemapSnapshot.id != new_snapshot.id,
        )
        .order_by(SitemapSnapshot.created_at.desc())
        .limit(1)
    )
    old_snapshot = result.scalar_one_or_none()

    if old_snapshot is None:
        # 首次快照，无需比较
        return ChangeResult(has_changes=False), None

    # 快速比较哈希
    if old_snapshot.url_hash == new_snapshot.url_hash:
        return ChangeResult(has_changes=False), old_snapshot

    # 详细比较
    change_result = compare_snapshots(old_snapshot.urls, new_snapshot.urls)
    return change_result, old_snapshot


async def create_change_record(
    db: AsyncSession,
    monitor_task_id: str,
    old_snapshot: SitemapSnapshot | None,
    new_snapshot: SitemapSnapshot,
    change_result: ChangeResult,
    is_initial: bool = False,
) -> ChangeRecord:
    """创建变更记录."""
    if is_initial:
        change_type = ChangeType.INITIAL.value
    elif change_result.has_changes:
        change_type = ChangeType.CHANGED.value
    else:
        change_type = ChangeType.NO_CHANGE.value

    record = ChangeRecord(
        monitor_task_id=monitor_task_id,
        old_snapshot_id=old_snapshot.id if old_snapshot else None,
        new_snapshot_id=new_snapshot.id,
        change_type=change_type,
        added_count=change_result.added_count,
        removed_count=change_result.removed_count,
        modified_count=change_result.modified_count,
        changes=change_result.to_dict(),
    )
    db.add(record)
    await db.flush()
    return record
