"""Sitemap 解析器."""

import io
from dataclasses import dataclass
from typing import Iterator

from lxml import etree

# Sitemap 命名空间
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
SITEMAP_INDEX_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"


@dataclass
class SitemapUrl:
    """Sitemap URL 条目."""

    url: str
    lastmod: str | None = None
    changefreq: str | None = None
    priority: str | None = None

    def to_dict(self) -> dict[str, str | None]:
        """转换为字典."""
        return {
            "url": self.url,
            "lastmod": self.lastmod,
            "changefreq": self.changefreq,
            "priority": self.priority,
        }


@dataclass
class SitemapIndexEntry:
    """Sitemap Index 条目."""

    loc: str
    lastmod: str | None = None


def parse_sitemap(content: bytes) -> Iterator[SitemapUrl]:
    """
    流式解析 Sitemap XML.

    使用 lxml iterparse 实现内存友好的流式解析，
    适合处理包含 10 万+ URL 的大型 Sitemap。

    Args:
        content: Sitemap XML 内容

    Yields:
        SitemapUrl 对象
    """
    context = etree.iterparse(
        io.BytesIO(content),
        events=("end",),
        tag=f"{{{SITEMAP_NS}}}url",
    )

    for _, elem in context:
        url = elem.findtext(f"{{{SITEMAP_NS}}}loc")
        if url:
            yield SitemapUrl(
                url=url.strip(),
                lastmod=_get_text(elem, "lastmod"),
                changefreq=_get_text(elem, "changefreq"),
                priority=_get_text(elem, "priority"),
            )
        # 释放内存
        elem.clear()
        # 清理父节点的引用
        while elem.getprevious() is not None:
            del elem.getparent()[0]


def parse_sitemap_index(content: bytes) -> Iterator[SitemapIndexEntry]:
    """
    解析 Sitemap Index XML.

    Args:
        content: Sitemap Index XML 内容

    Yields:
        SitemapIndexEntry 对象
    """
    context = etree.iterparse(
        io.BytesIO(content),
        events=("end",),
        tag=f"{{{SITEMAP_INDEX_NS}}}sitemap",
    )

    for _, elem in context:
        loc = elem.findtext(f"{{{SITEMAP_INDEX_NS}}}loc")
        if loc:
            yield SitemapIndexEntry(
                loc=loc.strip(),
                lastmod=_get_text(elem, "lastmod", ns=SITEMAP_INDEX_NS),
            )
        elem.clear()
        while elem.getprevious() is not None:
            del elem.getparent()[0]


def is_sitemap_index(content: bytes) -> bool:
    """
    检测内容是否为 Sitemap Index.

    Args:
        content: XML 内容

    Returns:
        True 如果是 Sitemap Index
    """
    try:
        # 只解析前几个元素来判断类型
        context = etree.iterparse(
            io.BytesIO(content),
            events=("start",),
        )
        for _, elem in context:
            tag = elem.tag
            if tag == f"{{{SITEMAP_INDEX_NS}}}sitemapindex":
                return True
            if tag == f"{{{SITEMAP_NS}}}urlset":
                return False
            # 只检查根元素
            break
    except etree.XMLSyntaxError:
        pass
    return False


def _get_text(elem: etree._Element, tag: str, ns: str = SITEMAP_NS) -> str | None:
    """获取子元素文本."""
    child = elem.find(f"{{{ns}}}{tag}")
    if child is not None and child.text:
        return child.text.strip()
    return None
