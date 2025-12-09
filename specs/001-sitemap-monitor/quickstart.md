# 快速开始指南: Sitemap 变更监控系统

本指南帮助你快速搭建开发环境并运行 Sitemap 变更监控系统。

## 前置条件

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- Git

## 1. 克隆项目

```bash
git clone <repository-url>
cd sitemap-monitor
```

## 2. 启动开发环境

使用 Docker Compose 启动所有依赖服务：

```bash
docker-compose up -d
```

这将启动：
- PostgreSQL (端口 5432)
- Redis (端口 6379)

## 3. 后端设置

### 3.1 创建虚拟环境

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
```

### 3.2 安装依赖

```bash
pip install -e ".[dev]"
```

### 3.3 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等
```

`.env` 示例：
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sitemap_monitor
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
```

### 3.4 初始化数据库

```bash
alembic upgrade head
```

### 3.5 启动后端服务

```bash
# 启动 API 服务
uvicorn sitemap_monitor.main:app --reload --port 8000

# 新终端：启动 Celery Worker
celery -A sitemap_monitor.tasks worker --loglevel=info

# 新终端：启动 Celery Beat（定时任务调度器）
celery -A sitemap_monitor.tasks beat --loglevel=info
```

## 4. 前端设置

### 4.1 安装依赖

```bash
cd frontend
npm install
```

### 4.2 配置环境变量

```bash
cp .env.example .env
```

`.env` 示例：
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 4.3 启动开发服务器

```bash
npm run dev
```

前端将在 http://localhost:3000 启动。

## 5. 验证安装

### 5.1 检查 API 健康状态

```bash
curl http://localhost:8000/health
```

应返回：
```json
{"status": "ok"}
```

### 5.2 查看 API 文档

访问 http://localhost:8000/docs 查看 Swagger UI。

### 5.3 访问前端

访问 http://localhost:3000，应看到登录页面。

## 6. 运行测试

### 后端测试

```bash
cd backend
pytest
```

### 前端测试

```bash
cd frontend
npm test
```

## 7. 常用命令

### 后端

```bash
# 创建数据库迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 回滚迁移
alembic downgrade -1

# 代码格式化
ruff format .

# 代码检查
ruff check .

# 类型检查
mypy src/
```

### 前端

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 类型检查
npm run typecheck
```

## 8. 项目结构

```
sitemap-monitor/
├── backend/
│   ├── src/sitemap_monitor/
│   │   ├── api/          # API 路由
│   │   ├── core/         # 核心业务逻辑
│   │   ├── models/       # 数据模型
│   │   ├── parsers/      # Sitemap 解析
│   │   ├── tasks/        # Celery 任务
│   │   └── config.py     # 配置
│   ├── tests/
│   ├── alembic/          # 数据库迁移
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/   # 通用组件
│   │   ├── pages/        # 页面
│   │   ├── services/     # API 调用
│   │   └── stores/       # 状态管理
│   ├── tests/
│   └── package.json
├── docker-compose.yml
└── specs/                # 功能规格文档
```

## 9. 故障排除

### 数据库连接失败

1. 确保 Docker 容器正在运行：`docker-compose ps`
2. 检查 DATABASE_URL 配置是否正确
3. 尝试直接连接：`psql $DATABASE_URL`

### Celery 任务不执行

1. 确保 Redis 正在运行
2. 检查 Worker 日志是否有错误
3. 确保 Beat 调度器正在运行

### 前端无法连接后端

1. 确保后端服务正在运行
2. 检查 VITE_API_BASE_URL 配置
3. 检查浏览器控制台是否有 CORS 错误

## 10. 下一步

- 阅读 [API 文档](./contracts/api.yaml) 了解接口详情
- 阅读 [数据模型](./data-model.md) 了解数据结构
- 阅读 [技术研究](./research.md) 了解技术选型决策
