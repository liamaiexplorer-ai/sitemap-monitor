# Sitemap Monitor Backend

Sitemap 变更监控系统后端服务。

## 技术栈

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (异步)
- Celery + Redis
- PostgreSQL

## 开发

```bash
# 安装依赖
pip install -e .

# 运行迁移
alembic upgrade head

# 启动服务
uvicorn sitemap_monitor.main:app --reload --port 8000
```
