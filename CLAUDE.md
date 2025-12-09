# Sitemap Monitor 开发指南

自动生成自所有功能计划。最后更新: 2025-12-04

## 活跃技术栈

### 后端 (Python 3.11+)
- **框架**: FastAPI
- **ORM**: SQLAlchemy 2.0
- **任务队列**: Celery + Redis
- **HTTP 客户端**: httpx
- **XML 解析**: lxml (流式 iterparse)
- **配置**: pydantic-settings
- **测试**: pytest + pytest-asyncio
- **代码质量**: ruff

### 前端 (TypeScript 5.x)
- **框架**: React 18
- **样式**: TailwindCSS
- **状态管理**: React Query
- **构建**: Vite
- **测试**: Vitest

### 基础设施
- **数据库**: PostgreSQL 15+
- **缓存/队列**: Redis 7
- **部署**: Docker Compose (开发), Kubernetes (生产)

## 项目结构

```text
backend/
├── src/sitemap_monitor/
│   ├── api/              # FastAPI 路由
│   ├── core/             # 核心业务逻辑
│   ├── models/           # SQLAlchemy 模型
│   ├── parsers/          # Sitemap 解析
│   ├── tasks/            # Celery 任务
│   └── config.py
├── tests/
├── alembic/              # 数据库迁移
└── pyproject.toml

frontend/
├── src/
│   ├── components/       # 通用组件
│   ├── pages/            # 页面
│   ├── services/         # API 调用
│   └── stores/           # 状态管理
├── tests/
└── package.json

specs/                    # 功能规格文档
docker-compose.yml
```

## 常用命令

### 后端

```bash
# 启动开发服务器
uvicorn sitemap_monitor.main:app --reload --port 8000

# 启动 Celery Worker
celery -A sitemap_monitor.tasks worker --loglevel=info

# 启动定时任务调度器
celery -A sitemap_monitor.tasks beat --loglevel=info

# 运行测试
pytest

# 代码格式化和检查
ruff format . && ruff check .

# 数据库迁移
alembic revision --autogenerate -m "描述"
alembic upgrade head
```

### 前端

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

### Docker

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 代码规范

### Python
- 所有公共 API 必须有类型注解
- 圈复杂度控制在 10 以内
- 使用 async/await 处理 I/O 操作
- 异常处理必须完整，禁止静默失败

### TypeScript
- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 使用 React Query 管理服务端状态

### 通用
- 每次提交保持可工作状态
- 新功能必须有对应测试
- 日志使用结构化格式 (JSON)

## 宪法原则

本项目遵循以下核心原则（详见 `.specify/memory/constitution.md`）：

1. **可靠性优先**: 重试机制、超时控制、异常处理
2. **性能高效**: 流式解析、异步 I/O、分批处理
3. **CLI 支持**: 提供管理 CLI 用于运维
4. **配置简洁**: 合理默认值、YAML 配置
5. **可观测性**: 结构化日志、进度信息
6. **代码质量**: 类型注解、测试覆盖
7. **增量交付**: 独立测试/部署

## 最近变更

- 001-sitemap-monitor: 初始功能规划完成

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
