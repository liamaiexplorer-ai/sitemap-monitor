#!/bin/bash

# 获取脚本所在目录的上一级目录（即 backend 目录）
BACKEND_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$BACKEND_DIR"

# 检查是否安装了 honcho (用于管理 Procfile)
if ! command -v honcho &> /dev/null; then
    echo "正在安装 honcho..."
    pip install honcho
fi

# 创建临时的 Procfile
cat > Procfile.dev <<EOF
web: uvicorn sitemap_monitor.main:app --reload --port 8000
worker: celery -A sitemap_monitor.tasks worker --loglevel=info
beat: celery -A sitemap_monitor.tasks beat --loglevel=info
EOF

echo "正在启动开发环境服务 (API + Worker + Beat)..."
echo "按 Ctrl+C 停止所有服务"

# 使用 honcho 启动所有进程
honcho start -f Procfile.dev

# 清理
rm Procfile.dev
