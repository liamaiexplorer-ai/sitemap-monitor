"""URL 验证服务."""

from dataclasses import dataclass
from urllib.parse import urlparse

import httpx

from sitemap_monitor.config import get_settings
from sitemap_monitor.parsers.sitemap import is_sitemap_index, parse_sitemap, parse_sitemap_index


@dataclass
class ValidationResult:
    """验证结果."""

    valid: bool
    is_index: bool = False
    url_count: int = 0
    child_sitemaps: int = 0
    error: str | None = None


async def validate_sitemap_url(url: str) -> ValidationResult:
    """
    验证 Sitemap URL.

    检查 URL 是否可访问，内容是否为有效的 Sitemap XML。

    Args:
        url: Sitemap URL

    Returns:
        ValidationResult 验证结果
    """
    # 基本 URL 格式验证
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return ValidationResult(valid=False, error="无效的 URL 格式")
        if parsed.scheme not in ("http", "https"):
            return ValidationResult(valid=False, error="URL 必须使用 http 或 https 协议")
    except Exception:
        return ValidationResult(valid=False, error="无效的 URL 格式")

    settings = get_settings()

    try:
        async with httpx.AsyncClient(
            timeout=settings.sitemap_request_timeout,
            follow_redirects=True,
            http2=True,
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

            content = response.content

            # 检查内容类型
            content_type = response.headers.get("content-type", "").lower()
            if not any(
                t in content_type
                for t in ("xml", "text/plain", "application/octet-stream")
            ):
                # 有些服务器可能返回错误的 content-type，尝试解析内容
                if not content.strip().startswith(b"<?xml") and not content.strip().startswith(b"<"):
                    return ValidationResult(
                        valid=False, error=f"无效的内容类型: {content_type}"
                    )

            # 判断是否为 Sitemap Index
            if is_sitemap_index(content):
                # 统计子 Sitemap 数量
                child_count = sum(1 for _ in parse_sitemap_index(content))
                return ValidationResult(
                    valid=True, is_index=True, child_sitemaps=child_count
                )
            else:
                # 统计 URL 数量（流式处理，不加载全部到内存）
                url_count = sum(1 for _ in parse_sitemap(content))
                return ValidationResult(valid=True, is_index=False, url_count=url_count)

    except httpx.TimeoutException:
        return ValidationResult(valid=False, error="请求超时")
    except httpx.HTTPStatusError as e:
        return ValidationResult(valid=False, error=f"HTTP 错误: {e.response.status_code}")
    except httpx.RequestError as e:
        return ValidationResult(valid=False, error=f"请求失败: {str(e)}")
    except Exception as e:
        return ValidationResult(valid=False, error=f"解析失败: {str(e)}")
