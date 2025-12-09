# Sitemap Monitor

Sitemap 变更监控系统 - 监控网站 Sitemap 变更并发送通知。

## 功能特性

- 📡 **Sitemap 监控**: 添加 Sitemap URL 进行定期监控
- 🔔 **变更通知**: 支持邮件和 Webhook 通知
- 📊 **变更历史**: 查看详细的变更记录
- ⚙️ **灵活配置**: 自定义检查间隔和通知方式
- 🎓 **新手引导**: 首次使用有完整引导流程

## 技术栈

### 后端
- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (异步)
- Celery + Redis
- PostgreSQL 15+

### 前端
- React 18
- TypeScript
- Vite
- TailwindCSS

## 快速开始

### 前置要求

- Docker & Docker Compose
- Node.js 18+ (前端开发)
- Python 3.11+ (后端开发)

### 使用 Docker Compose 启动

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 本地开发

#### 启动基础服务

```bash
docker-compose up -d postgres redis
```

#### 后端开发

```bash
cd backend

# 安装依赖
pip install -e .

# 数据库迁移
alembic upgrade head

# 启动开发服务器
uvicorn sitemap_monitor.main:app --reload --port 8000

# 启动 Celery Worker（新终端）
celery -A sitemap_monitor.tasks worker --loglevel=info

# 启动定时调度器（新终端）
celery -A sitemap_monitor.tasks beat --loglevel=info
```

#### 前端开发

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 配置

### 环境变量

后端通过环境变量或 `.env` 文件配置：

```env
# 数据库
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/sitemap_monitor

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# SMTP (邮件通知)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASSWORD=password
SMTP_FROM=noreply@example.com

# 应用配置
DEBUG=false
CORS_ORIGINS=["http://localhost:5173"]
```

## API 文档

启动后端后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
.
├── backend/
│   ├── src/sitemap_monitor/
│   │   ├── api/          # API 路由
│   │   ├── core/         # 核心业务逻辑
│   │   ├── models/       # 数据模型
│   │   ├── parsers/      # Sitemap 解析
│   │   └── tasks/        # Celery 任务
│   ├── alembic/          # 数据库迁移
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/   # UI 组件
│   │   ├── pages/        # 页面
│   │   ├── services/     # API 服务
│   │   └── stores/       # 状态管理
│   └── tests/
└── docker-compose.yml
```

## 开发命令

### 后端

```bash
# 代码格式化
ruff format .

# 代码检查
ruff check .

# 运行测试
pytest

# 生成迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head
```

### 前端

```bash
# 代码检查
npm run lint

# 运行测试
npm test

# 构建生产版本
npm run build
```

## 许可证

MIT
