"""Sitemap 检查器."""

import time
from dataclasses import dataclass

import httpx

from sitemap_monitor.config import get_settings
from sitemap_monitor.logging import get_logger
from sitemap_monitor.parsers.sitemap import parse_sitemap, is_sitemap_index, parse_sitemap_index

logger = get_logger(__name__)


@dataclass
class FetchResult:
    """获取结果."""

    success: bool
    content: bytes | None = None
    error: str | None = None
    duration_ms: int = 0


async def fetch_sitemap(url: str, retries: int = 3) -> FetchResult:
    """
    获取 Sitemap 内容.

    支持重试机制。

    Args:
        url: Sitemap URL
        retries: 重试次数

    Returns:
        FetchResult 获取结果
    """
    settings = get_settings()
    last_error = None

    for attempt in range(retries):
        start_time = time.time()
        try:
            async with httpx.AsyncClient(
                timeout=settings.sitemap_request_timeout,
                follow_redirects=True,
                http2=True,
            ) as client:
                response = await client.get(url)
                response.raise_for_status()

                duration_ms = int((time.time() - start_time) * 1000)
                return FetchResult(
                    success=True,
                    content=response.content,
                    duration_ms=duration_ms,
                )

        except httpx.TimeoutException:
            last_error = "请求超时"
            logger.warning(
                "Sitemap fetch timeout",
                url=url,
                attempt=attempt + 1,
                max_retries=retries,
            )
        except httpx.HTTPStatusError as e:
            last_error = f"HTTP 错误: {e.response.status_code}"
            logger.warning(
                "Sitemap fetch HTTP error",
                url=url,
                status_code=e.response.status_code,
                attempt=attempt + 1,
            )
        except httpx.RequestError as e:
            last_error = f"请求失败: {str(e)}"
            logger.warning(
                "Sitemap fetch request error",
                url=url,
                error=str(e),
                attempt=attempt + 1,
            )

        # 重试前等待
        if attempt < retries - 1:
            await _async_sleep(settings.sitemap_retry_delay)

    duration_ms = int((time.time() - start_time) * 1000)
    return FetchResult(success=False, error=last_error, duration_ms=duration_ms)


async def _async_sleep(seconds: int) -> None:
    """异步等待."""
    import asyncio
    await asyncio.sleep(seconds)


@dataclass
class CheckResult:
    """检查结果."""

    success: bool
    urls: list[dict] = None  # type: ignore
    url_count: int = 0
    fetch_duration_ms: int = 0
    parse_duration_ms: int = 0
    error: str | None = None

    def __post_init__(self):
        if self.urls is None:
            self.urls = []


async def check_sitemap(url: str) -> CheckResult:
    """
    检查 Sitemap 并返回 URL 列表.

    支持 Sitemap Index（递归获取所有子 Sitemap）。

    Args:
        url: Sitemap URL

    Returns:
        CheckResult 检查结果
    """
    # 获取内容
    fetch_result = await fetch_sitemap(url)
    if not fetch_result.success:
        return CheckResult(
            success=False,
            error=fetch_result.error,
            fetch_duration_ms=fetch_result.duration_ms,
        )

    content = fetch_result.content
    if not content:
        return CheckResult(
            success=False,
            error="内容为空",
            fetch_duration_ms=fetch_result.duration_ms,
        )

    # 解析内容
    parse_start = time.time()
    try:
        if is_sitemap_index(content):
            # Sitemap Index：递归获取所有子 Sitemap
            all_urls = []
            total_fetch_duration = fetch_result.duration_ms

            for entry in parse_sitemap_index(content):
                sub_result = await check_sitemap(entry.loc)
                if sub_result.success:
                    all_urls.extend(sub_result.urls)
                    total_fetch_duration += sub_result.fetch_duration_ms

            parse_duration_ms = int((time.time() - parse_start) * 1000)
            return CheckResult(
                success=True,
                urls=all_urls,
                url_count=len(all_urls),
                fetch_duration_ms=total_fetch_duration,
                parse_duration_ms=parse_duration_ms,
            )
        else:
            # 普通 Sitemap
            urls = [url_entry.to_dict() for url_entry in parse_sitemap(content)]
            parse_duration_ms = int((time.time() - parse_start) * 1000)

            return CheckResult(
                success=True,
                urls=urls,
                url_count=len(urls),
                fetch_duration_ms=fetch_result.duration_ms,
                parse_duration_ms=parse_duration_ms,
            )

    except Exception as e:
        parse_duration_ms = int((time.time() - parse_start) * 1000)
        logger.error("Sitemap parse error", url=url, error=str(e))
        return CheckResult(
            success=False,
            error=f"解析失败: {str(e)}",
            fetch_duration_ms=fetch_result.duration_ms,
            parse_duration_ms=parse_duration_ms,
        )
