"""变更比对器."""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class ChangeResult:
    """变更结果."""

    has_changes: bool
    added: list[dict[str, Any]] = field(default_factory=list)
    removed: list[dict[str, Any]] = field(default_factory=list)
    modified: list[dict[str, Any]] = field(default_factory=list)

    @property
    def added_count(self) -> int:
        return len(self.added)

    @property
    def removed_count(self) -> int:
        return len(self.removed)

    @property
    def modified_count(self) -> int:
        return len(self.modified)

    def to_dict(self) -> dict[str, Any]:
        """转换为字典（用于存储）."""
        return {
            "added": self.added,
            "removed": self.removed,
            "modified": self.modified,
        }


def compare_snapshots(
    old_urls: list[dict[str, Any]], new_urls: list[dict[str, Any]]
) -> ChangeResult:
    """
    比较两个快照的 URL 列表.

    检测新增、删除和修改的 URL。
    修改的判断标准：lastmod 发生变化。

    Args:
        old_urls: 旧的 URL 列表
        new_urls: 新的 URL 列表

    Returns:
        ChangeResult 变更结果
    """
    # 构建 URL -> 详情映射
    old_map = {item["url"]: item for item in old_urls}
    new_map = {item["url"]: item for item in new_urls}

    old_url_set = set(old_map.keys())
    new_url_set = set(new_map.keys())

    # 新增的 URL
    added_urls = new_url_set - old_url_set
    added = [new_map[url] for url in added_urls]

    # 删除的 URL
    removed_urls = old_url_set - new_url_set
    removed = [old_map[url] for url in removed_urls]

    # 修改的 URL（交集中 lastmod 不同的）
    common_urls = old_url_set & new_url_set
    modified = []
    for url in common_urls:
        old_lastmod = old_map[url].get("lastmod")
        new_lastmod = new_map[url].get("lastmod")
        if old_lastmod != new_lastmod:
            modified.append({
                "url": url,
                "old_lastmod": old_lastmod,
                "new_lastmod": new_lastmod,
            })

    has_changes = bool(added or removed or modified)

    return ChangeResult(
        has_changes=has_changes,
        added=added,
        removed=removed,
        modified=modified,
    )
