FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制所有文件
COPY pyproject.toml README.md ./
COPY src/ src/
COPY alembic/ alembic/
COPY alembic.ini .
COPY scripts/ scripts/

# 安装 Python 依赖
RUN pip install --no-cache-dir -e .

# 设置脚本权限
RUN chmod +x scripts/*.sh

# 设置环境变量
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["./scripts/start.sh"]
