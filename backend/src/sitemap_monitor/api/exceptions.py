"""API 异常处理."""

from fastapi import HTTPException, status


class NotFoundError(HTTPException):
    """资源未找到异常."""

    def __init__(self, detail: str = "资源未找到"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class BadRequestError(HTTPException):
    """请求错误异常."""

    def __init__(self, detail: str = "请求参数错误"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedError(HTTPException):
    """未授权异常."""

    def __init__(self, detail: str = "未认证"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenError(HTTPException):
    """禁止访问异常."""

    def __init__(self, detail: str = "无权访问"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class ConflictError(HTTPException):
    """冲突异常."""

    def __init__(self, detail: str = "资源冲突"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ValidationError(HTTPException):
    """验证错误异常."""

    def __init__(self, detail: str = "数据验证失败"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)
