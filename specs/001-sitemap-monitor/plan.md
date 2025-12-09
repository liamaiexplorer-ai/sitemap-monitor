# 实现计划: Sitemap 变更监控系统

**分支**: `001-sitemap-monitor` | **日期**: 2025-12-04 | **规格**: [spec.md](./spec.md)
**输入**: 功能规格说明 `/specs/001-sitemap-monitor/spec.md`

## 摘要

构建一个 Web 应用，允许用户监控任意网站的 Sitemap 变更。系统定期检查已注册的 Sitemap，检测 URL 的新增、删除和修改，并通过可扩展的通知渠道（邮件、Webhook）通知用户。提供简洁的 Web 界面供用户管理监控任务和查看变更历史。

**技术方案**：采用前后端分离架构，Python 后端 + React 前端，使用 PostgreSQL 存储数据，Celery 处理定时任务。

## 技术上下文

**语言/版本**: Python 3.11+ (后端), TypeScript 5.x (前端)
**主要依赖**:
- 后端: FastAPI, SQLAlchemy, Celery, httpx, lxml
- 前端: React 18, TailwindCSS, React Query
**存储**: PostgreSQL 15+ (主数据库), Redis (任务队列和缓存)
**测试**: pytest + pytest-asyncio (后端), Vitest (前端)
**目标平台**: Linux 服务器 (Docker 部署), 现代浏览器
**项目类型**: Web 应用 (前后端分离)
**性能目标**:
- 处理 10 万 URL 的 Sitemap 耗时 < 60 秒
- API 响应时间 p95 < 200ms
- 支持 1000+ 并发监控任务
**约束**:
- 单次 Sitemap 请求超时 30 秒
- 变更检测后 5 分钟内发送通知
- 数据保留 90 天
**规模**: 1000+ 监控任务, 10+ 用户

## 宪法检查

*GATE: 必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。*

| 原则 | 要求 | 状态 | 说明 |
|------|------|------|------|
| I. 可靠性优先 | 重试机制、超时控制、异常处理、数据持久化 | ✅ | httpx 支持重试，Celery 支持任务重试，PostgreSQL 持久化 |
| II. 性能高效 | 流式 XML 解析、异步 I/O、分批处理 | ✅ | lxml iterparse 流式解析，httpx 异步，分页处理 |
| III. CLI 优先 | CLI 暴露、管道支持、JSON 输出 | ⚠️ | 主要是 Web 应用，但会提供管理 CLI |
| IV. 配置简洁 | 合理默认、YAML 配置、环境变量 | ✅ | pydantic-settings 管理配置 |
| V. 可观测性 | 结构化日志、进度信息 | ✅ | structlog JSON 日志 |
| VI. 代码质量 | 类型注解、低圈复杂度、测试覆盖 | ✅ | 强制类型注解，ruff 检查 |
| VII. 增量交付 | 独立测试/部署、向后兼容 | ✅ | 用户故事可独立交付 |

**CLI 原则说明**: 本项目主要是 Web 应用，但会提供管理 CLI 用于运维操作（如手动触发检查、清理数据等）。这符合用户需求中"简单易用的界面"的要求。

## 项目结构

### 文档 (本功能)

```text
specs/001-sitemap-monitor/
├── plan.md              # 本文件
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/           # Phase 1 输出
│   └── api.yaml         # OpenAPI 规范
└── tasks.md             # Phase 2 输出 (/speckit.tasks 生成)
```

### 源代码 (仓库根目录)

```text
backend/
├── src/
│   └── sitemap_monitor/
│       ├── __init__.py
│       ├── api/              # FastAPI 路由
│       │   ├── __init__.py
│       │   ├── auth.py       # 认证相关
│       │   ├── monitors.py   # 监控任务 CRUD
│       │   ├── changes.py    # 变更历史
│       │   └── notifications.py  # 通知配置
│       ├── core/             # 核心业务逻辑
│       │   ├── __init__.py
│       │   ├── checker.py    # Sitemap 检查器
│       │   ├── differ.py     # 变更比对
│       │   └── notifier.py   # 通知发送
│       ├── models/           # SQLAlchemy 模型
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── monitor.py
│       │   ├── snapshot.py
│       │   └── notification.py
│       ├── parsers/          # Sitemap 解析
│       │   ├── __init__.py
│       │   └── sitemap.py
│       ├── tasks/            # Celery 任务
│       │   ├── __init__.py
│       │   └── scheduler.py
│       ├── cli/              # 管理命令
│       │   └── __init__.py
│       └── config.py         # 配置管理
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── alembic/                  # 数据库迁移
├── pyproject.toml
└── Dockerfile

frontend/
├── src/
│   ├── components/           # 通用组件
│   │   ├── Layout/
│   │   ├── Forms/
│   │   └── UI/
│   ├── pages/                # 页面组件
│   │   ├── Dashboard/
│   │   ├── Monitors/
│   │   ├── Changes/
│   │   ├── Settings/
│   │   └── Auth/
│   ├── services/             # API 调用
│   │   └── api.ts
│   ├── hooks/                # 自定义 hooks
│   ├── stores/               # 状态管理
│   └── App.tsx
├── tests/
├── package.json
├── vite.config.ts
└── Dockerfile

docker-compose.yml            # 本地开发环境
```

**结构决策**: 采用前后端分离的 Web 应用架构。后端使用 FastAPI 提供 RESTful API，前端使用 React 构建 SPA。定时任务使用 Celery + Redis。这种架构满足"简单易用的界面"需求，同时保持后端逻辑清晰。

## 复杂度追踪

> **仅在宪法检查有违规需要说明时填写**

| 违规 | 必要原因 | 拒绝更简单方案的原因 |
|------|---------|---------------------|
| Web 应用而非纯 CLI | 用户明确要求"简单易用的界面"，需要 Web UI | CLI 不满足新手友好要求 |
| 前后端分离 | 界面复杂度需要现代前端框架支持响应式设计 | 服务端渲染增加后端复杂度 |
| Celery 任务队列 | 需要可靠的定时任务调度和重试机制 | cron + 脚本不支持分布式和重试 |
