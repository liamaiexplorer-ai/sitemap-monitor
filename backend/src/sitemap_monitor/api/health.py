"""健康检查 API."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """健康检查端点."""
    return {"status": "ok"}
