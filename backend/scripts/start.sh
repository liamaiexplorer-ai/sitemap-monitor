#!/bin/bash
set -e

echo "等待数据库就绪..."
sleep 3

echo "运行数据库迁移..."
alembic upgrade head

echo "启动应用..."
exec uvicorn sitemap_monitor.main:app --host 0.0.0.0 --port 8000
