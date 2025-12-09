# 任务列表: Sitemap 变更监控系统

**输入**: 设计文档 `/specs/001-sitemap-monitor/`
**前置条件**: plan.md (必需), spec.md (必需), data-model.md, contracts/api.yaml, research.md, quickstart.md

**测试**: 本任务列表不包含测试任务（未在规格中明确要求 TDD）

**组织**: 任务按用户故事分组，支持独立实现和测试

## 格式: `[ID] [P?] [Story] 描述`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（如 US1, US2）
- 包含具体文件路径

## 路径约定

- **后端**: `backend/src/sitemap_monitor/`
- **前端**: `frontend/src/`
- **测试**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: Setup (项目初始化)

**目的**: 项目基础设施和开发环境

- [X] T001 创建后端项目结构 `backend/` 目录，初始化 `pyproject.toml` 配置 FastAPI, SQLAlchemy, Celery, httpx, lxml 依赖
- [X] T002 [P] 创建前端项目结构 `frontend/` 目录，初始化 Vite + React + TypeScript + TailwindCSS
- [X] T003 [P] 创建 `docker-compose.yml` 配置 PostgreSQL 15 和 Redis 7 开发环境
- [X] T004 配置后端 `backend/src/sitemap_monitor/config.py` 使用 pydantic-settings 管理配置（数据库、Redis、SMTP、JWT）
- [X] T005 [P] 配置后端日志 `backend/src/sitemap_monitor/logging.py` 使用 structlog 实现 JSON 结构化日志
- [X] T006 [P] 配置代码质量工具：后端 ruff (lint+format)，前端 ESLint + Prettier
- [X] T007 初始化 Alembic 数据库迁移框架 `backend/alembic/`

---

## Phase 2: Foundational (基础设施 - 阻塞所有用户故事)

**目的**: 所有用户故事依赖的核心基础设施

**⚠️ 关键**: 此阶段必须完成后才能开始任何用户故事

- [X] T008 创建数据库基类和 Session 管理 `backend/src/sitemap_monitor/models/__init__.py`
- [X] T009 创建 User 模型 `backend/src/sitemap_monitor/models/user.py` (id, email, password_hash, is_active, is_verified, has_completed_onboarding, created_at, updated_at, last_login_at)
- [X] T010 [P] 创建 MonitorTask 模型 `backend/src/sitemap_monitor/models/monitor.py` (id, user_id, name, sitemap_url, check_interval_minutes, status, last_check_at, last_error, error_count, created_at, updated_at)
- [X] T011 [P] 创建 SitemapSnapshot 模型 `backend/src/sitemap_monitor/models/snapshot.py` (id, monitor_task_id, url_count, url_hash, urls JSONB, fetch_duration_ms, parse_duration_ms, created_at)
- [X] T012 [P] 创建 ChangeRecord 模型 `backend/src/sitemap_monitor/models/snapshot.py` (id, monitor_task_id, old_snapshot_id, new_snapshot_id, change_type, added_count, removed_count, modified_count, changes JSONB, created_at)
- [X] T013 [P] 创建 NotificationChannel 模型 `backend/src/sitemap_monitor/models/notification.py` (id, user_id, name, channel_type, config JSONB, is_active, last_test_at, last_test_success, created_at, updated_at)
- [X] T014 [P] 创建 MonitorTaskChannel 关联模型 `backend/src/sitemap_monitor/models/notification.py` (monitor_task_id, channel_id, created_at)
- [X] T015 [P] 创建 NotificationLog 模型 `backend/src/sitemap_monitor/models/notification.py` (id, channel_id, change_record_id, status, error_message, sent_at, response_code, retry_count)
- [X] T016 生成初始数据库迁移 `alembic revision --autogenerate -m "initial_schema"` 并应用
- [X] T017 创建 FastAPI 应用入口和路由挂载 `backend/src/sitemap_monitor/main.py`
- [X] T018 [P] 创建 JWT 认证中间件和依赖 `backend/src/sitemap_monitor/api/deps.py` (get_current_user, require_auth)
- [X] T019 [P] 创建通用异常处理器 `backend/src/sitemap_monitor/api/exceptions.py`
- [X] T020 [P] 配置 CORS 中间件 `backend/src/sitemap_monitor/main.py`
- [X] T021 初始化 Celery 应用 `backend/src/sitemap_monitor/tasks/__init__.py` 配置 Redis broker
- [X] T022 [P] 创建前端 API 客户端基础 `frontend/src/services/api.ts` 配置 axios 拦截器处理 JWT
- [X] T023 [P] 创建前端通用 UI 组件库 `frontend/src/components/UI/` (Button, Input, Card, Modal, Toast)
- [X] T024 [P] 创建前端布局组件 `frontend/src/components/Layout/` (AppLayout, AuthLayout, Sidebar, Header)

**检查点**: 基础设施就绪 - 用户故事实现可以开始

---

## Phase 3: 用户故事 4 - 用户注册与登录 (优先级: P2) 🔐

**目标**: 用户可以注册账号并登录系统

**独立测试**: 新用户通过注册页面创建账号，然后使用该账号登录系统进入主界面

**说明**: 虽然 P2 优先级，但认证是其他所有功能的前置依赖，必须先实现

### 后端实现

- [X] T025 [US4] 创建认证服务 `backend/src/sitemap_monitor/core/auth.py` (hash_password, verify_password, create_access_token, create_refresh_token, verify_token)
- [X] T026 [US4] 实现注册 API `backend/src/sitemap_monitor/api/auth.py` POST /auth/register
- [X] T027 [US4] 实现登录 API `backend/src/sitemap_monitor/api/auth.py` POST /auth/login (返回 JWT, 设置 refresh token cookie)
- [X] T028 [US4] 实现登出 API `backend/src/sitemap_monitor/api/auth.py` POST /auth/logout
- [X] T029 [US4] 实现刷新令牌 API `backend/src/sitemap_monitor/api/auth.py` POST /auth/refresh
- [X] T030 [P] [US4] 实现密码重置请求 API `backend/src/sitemap_monitor/api/auth.py` POST /auth/password/reset-request
- [X] T031 [P] [US4] 实现密码重置 API `backend/src/sitemap_monitor/api/auth.py` POST /auth/password/reset
- [X] T032 [P] [US4] 实现获取当前用户 API `backend/src/sitemap_monitor/api/users.py` GET /users/me
- [X] T033 [P] [US4] 实现修改密码 API `backend/src/sitemap_monitor/api/users.py` PUT /users/me/password

### 前端实现

- [X] T034 [US4] 创建认证状态管理 `frontend/src/stores/authStore.ts` (user, token, login, logout, refresh)
- [X] T035 [US4] 创建登录页面 `frontend/src/pages/Auth/LoginPage.tsx`
- [X] T036 [P] [US4] 创建注册页面 `frontend/src/pages/Auth/RegisterPage.tsx`
- [X] T037 [P] [US4] 创建忘记密码页面 `frontend/src/pages/Auth/ForgotPasswordPage.tsx`
- [X] T038 [P] [US4] 创建重置密码页面 `frontend/src/pages/Auth/ResetPasswordPage.tsx`
- [X] T039 [US4] 配置前端路由保护 `frontend/src/App.tsx` (PrivateRoute, PublicRoute)

**检查点**: 用户可以注册、登录、登出、重置密码

---

## Phase 4: 用户故事 1 - 添加 Sitemap 监控 (优先级: P1) 🎯 MVP

**目标**: 用户可以添加 Sitemap URL 进行监控

**独立测试**: 用户注册账号后添加一个 Sitemap URL，系统显示该 URL 已被成功添加到监控列表

### 后端实现

- [X] T040 [US1] 创建 Sitemap 解析器 `backend/src/sitemap_monitor/parsers/sitemap.py` (parse_sitemap, parse_sitemap_index) 使用 lxml iterparse 流式解析
- [X] T041 [US1] 创建 URL 验证服务 `backend/src/sitemap_monitor/core/validator.py` (validate_sitemap_url) 使用 httpx 异步获取并验证 Sitemap 格式
- [X] T042 [US1] 创建监控任务服务 `backend/src/sitemap_monitor/core/monitor_service.py` (create_monitor, get_monitors, get_monitor, update_monitor, delete_monitor, pause_monitor, resume_monitor)
- [X] T043 [US1] 实现验证 Sitemap URL API `backend/src/sitemap_monitor/api/monitors.py` POST /monitors/validate-url
- [X] T044 [US1] 实现创建监控任务 API `backend/src/sitemap_monitor/api/monitors.py` POST /monitors
- [X] T045 [P] [US1] 实现获取监控列表 API `backend/src/sitemap_monitor/api/monitors.py` GET /monitors
- [X] T046 [P] [US1] 实现获取监控详情 API `backend/src/sitemap_monitor/api/monitors.py` GET /monitors/{monitor_id}
- [X] T047 [P] [US1] 实现更新监控任务 API `backend/src/sitemap_monitor/api/monitors.py` PATCH /monitors/{monitor_id}
- [X] T048 [P] [US1] 实现删除监控任务 API `backend/src/sitemap_monitor/api/monitors.py` DELETE /monitors/{monitor_id}
- [X] T049 [P] [US1] 实现暂停/恢复监控 API `backend/src/sitemap_monitor/api/monitors.py` POST /monitors/{monitor_id}/pause, /resume

### 前端实现

- [X] T050 [US1] 创建监控任务 API 服务 `frontend/src/services/monitors.ts`
- [X] T051 [US1] 创建添加监控表单组件 `frontend/src/components/Forms/AddMonitorForm.tsx` (URL 输入、验证、检查间隔选择)
- [X] T052 [US1] 创建监控列表页面 `frontend/src/pages/Monitors/MonitorListPage.tsx`
- [X] T053 [P] [US1] 创建监控卡片组件 `frontend/src/components/Monitors/MonitorCard.tsx` (显示 URL、状态、最后检查时间、操作按钮)
- [X] T054 [P] [US1] 创建监控详情页面 `frontend/src/pages/Monitors/MonitorDetailPage.tsx`
- [X] T055 [US1] 创建 Dashboard 页面 `frontend/src/pages/Dashboard/DashboardPage.tsx` (监控概览、快速添加入口)

**检查点**: 用户可以添加、查看、编辑、删除、暂停/恢复监控任务

---

## Phase 5: 用户故事 2 - 接收变更通知 (优先级: P1) 📢

**目标**: Sitemap 变更时用户收到通知

**独立测试**: 添加一个 Sitemap 监控后，当该 Sitemap 发生变更时，用户在配置的通知渠道收到变更通知

### 后端实现

- [X] T056 [US2] 创建 Sitemap 检查器 `backend/src/sitemap_monitor/core/checker.py` (fetch_sitemap, check_monitor) 使用 httpx 异步获取，支持重试
- [X] T057 [US2] 创建变更比对器 `backend/src/sitemap_monitor/core/differ.py` (compare_snapshots) 检测新增、删除、修改的 URL
- [X] T058 [US2] 创建快照服务 `backend/src/sitemap_monitor/core/snapshot_service.py` (create_snapshot, get_latest_snapshot, compare_with_previous)
- [X] T059 [US2] 创建变更记录服务 `backend/src/sitemap_monitor/core/change_service.py` (create_change_record, get_changes)
- [X] T060 [US2] 创建邮件通知器 `backend/src/sitemap_monitor/core/notifiers/email.py` (send_change_notification)
- [X] T061 [P] [US2] 创建 Webhook 通知器 `backend/src/sitemap_monitor/core/notifiers/webhook.py` (send_webhook_notification)
- [X] T062 [US2] 创建通知调度器 `backend/src/sitemap_monitor/core/notifier.py` (notify_change) 根据配置的渠道发送通知
- [X] T063 [US2] 创建 Celery 定时检查任务 `backend/src/sitemap_monitor/tasks/scheduler.py` (check_sitemap_task, schedule_checks)
- [X] T064 [US2] 配置 Celery Beat 定时调度 `backend/src/sitemap_monitor/tasks/scheduler.py` 每分钟检查需要执行的任务
- [X] T065 [P] [US2] 实现手动触发检查 API `backend/src/sitemap_monitor/api/monitors.py` POST /monitors/{monitor_id}/check

**检查点**: 系统定期检查 Sitemap，检测到变更时发送邮件/Webhook 通知

---

## Phase 6: 用户故事 3 - 查看监控列表和变更历史 (优先级: P2) 📊

**目标**: 用户可以查看变更历史详情

**独立测试**: 用户登录后进入"我的监控"页面，点击任意一个 Sitemap 可查看其变更历史

### 后端实现

- [X] T066 [US3] 实现获取变更历史列表 API `backend/src/sitemap_monitor/api/changes.py` GET /monitors/{monitor_id}/changes (支持分页、日期筛选)
- [X] T067 [P] [US3] 实现获取变更详情 API `backend/src/sitemap_monitor/api/changes.py` GET /monitors/{monitor_id}/changes/{change_id}

### 前端实现

- [X] T068 [US3] 创建变更历史 API 服务 `frontend/src/services/changes.ts`
- [X] T069 [US3] 创建变更历史列表组件 `frontend/src/components/Changes/ChangeList.tsx` (时间、变更类型、URL 数量)
- [X] T070 [P] [US3] 创建变更详情组件 `frontend/src/components/Changes/ChangeDetail.tsx` (新增/删除/修改的 URL 列表)
- [X] T071 [US3] 在监控详情页面集成变更历史 `frontend/src/pages/Monitors/MonitorDetailPage.tsx`

**检查点**: 用户可以查看每个监控任务的变更历史和详情

---

## Phase 7: 用户故事 5 - 配置通知渠道 (优先级: P3) ⚙️

**目标**: 用户可以配置多种通知方式

**独立测试**: 用户在"通知设置"页面添加 Webhook 地址，然后在某个监控任务上启用该 Webhook 通知

### 后端实现

- [X] T072 [US5] 创建通知渠道服务 `backend/src/sitemap_monitor/core/notification_service.py` (create_channel, get_channels, update_channel, delete_channel, test_channel)
- [X] T073 [US5] 实现通知渠道 CRUD API `backend/src/sitemap_monitor/api/notifications.py` (GET/POST /notification-channels, GET/PATCH/DELETE /notification-channels/{id})
- [X] T074 [P] [US5] 实现测试通知渠道 API `backend/src/sitemap_monitor/api/notifications.py` POST /notification-channels/{id}/test
- [X] T075 [P] [US5] 实现设置监控任务通知渠道 API `backend/src/sitemap_monitor/api/notifications.py` GET/PUT /monitors/{id}/channels

### 前端实现

- [X] T076 [US5] 创建通知渠道 API 服务 `frontend/src/services/notifications.ts`
- [X] T077 [US5] 创建通知设置页面 `frontend/src/pages/Settings/NotificationSettingsPage.tsx`
- [X] T078 [P] [US5] 创建添加渠道表单组件 `frontend/src/components/Forms/AddChannelForm.tsx` (支持 Email/Webhook)
- [X] T079 [P] [US5] 创建渠道列表组件 `frontend/src/components/Settings/ChannelList.tsx`
- [X] T080 [US5] 在监控编辑页面添加通知渠道选择 `frontend/src/pages/Monitors/MonitorEditPage.tsx`

**检查点**: 用户可以配置邮件/Webhook 通知渠道，并为监控任务选择通知方式

---

## Phase 8: 用户故事 6 - 新手引导 (优先级: P3) 🎓

**目标**: 首次使用的用户有清晰的引导

**独立测试**: 新用户首次登录后，系统显示引导流程，用户可以跟随引导完成第一个监控任务的创建

### 后端实现

- [X] T081 [US6] 实现完成引导 API `backend/src/sitemap_monitor/api/users.py` POST /users/me/onboarding

### 前端实现

- [X] T082 [US6] 创建引导状态管理 `frontend/src/stores/onboardingStore.ts`
- [X] T083 [US6] 创建引导步骤组件 `frontend/src/components/Onboarding/OnboardingSteps.tsx` (欢迎、添加第一个监控、配置通知、完成)
- [X] T084 [US6] 创建引导 Modal 组件 `frontend/src/components/Onboarding/OnboardingModal.tsx`
- [X] T085 [US6] 集成引导到 Dashboard `frontend/src/pages/Dashboard/DashboardPage.tsx` (首次登录时显示引导)

**检查点**: 新用户首次登录看到引导流程，完成后不再显示

---

## Phase 9: Polish & 跨领域关注点

**目的**: 优化、文档、部署准备

- [X] T086 [P] 创建 README.md 项目文档
- [X] T087 [P] 创建后端 Dockerfile `backend/Dockerfile`
- [X] T088 [P] 创建前端 Dockerfile `frontend/Dockerfile`
- [X] T089 更新 docker-compose.yml 添加应用服务
- [X] T090 [P] 添加数据清理定时任务 `backend/src/sitemap_monitor/tasks/cleanup.py` (清理 90 天前的快照和变更记录)
- [X] T091 [P] 添加健康检查端点 `backend/src/sitemap_monitor/api/health.py` GET /health
- [X] T092 前端响应式设计优化 (移动端适配)
- [ ] T093 运行 quickstart.md 验证完整流程

---

## 依赖关系与执行顺序

### 阶段依赖

- **Phase 1 (Setup)**: 无依赖 - 可立即开始
- **Phase 2 (Foundational)**: 依赖 Phase 1 - **阻塞所有用户故事**
- **Phase 3 (US4 认证)**: 依赖 Phase 2 - 必须先完成，其他故事依赖认证
- **Phase 4 (US1 监控)**: 依赖 Phase 3 - 核心功能
- **Phase 5 (US2 通知)**: 依赖 Phase 4 - 需要监控任务存在
- **Phase 6 (US3 历史)**: 依赖 Phase 5 - 需要变更记录存在
- **Phase 7 (US5 渠道配置)**: 依赖 Phase 3 - 可与 Phase 4-6 并行
- **Phase 8 (US6 引导)**: 依赖 Phase 4 - 需要添加监控功能
- **Phase 9 (Polish)**: 依赖所有用户故事完成

### 用户故事依赖

```
US4 (认证) ──┬──▶ US1 (监控) ──▶ US2 (通知) ──▶ US3 (历史)
             │
             ├──▶ US5 (渠道配置) [可并行]
             │
             └──▶ US6 (引导) [依赖 US1]
```

### 并行机会

- Phase 1: T002, T003 可并行
- Phase 2: T010-T015, T018-T020, T022-T024 可并行
- Phase 3: T030-T033, T036-T038 可并行
- Phase 4: T045-T049, T053-T054 可并行
- Phase 5: T061, T065 可并行
- Phase 6: T067, T070 可并行
- Phase 7: T074-T075, T078-T079 可并行
- Phase 9: T086-T088, T090-T091 可并行

---

## 并行执行示例

### Phase 2 并行任务组

```bash
# 并行创建所有模型（不同文件，无依赖）:
Task: "T010 [P] 创建 MonitorTask 模型"
Task: "T011 [P] 创建 SitemapSnapshot 模型"
Task: "T012 [P] 创建 ChangeRecord 模型"
Task: "T013 [P] 创建 NotificationChannel 模型"
Task: "T014 [P] 创建 MonitorTaskChannel 关联模型"
Task: "T015 [P] 创建 NotificationLog 模型"

# 并行创建中间件和前端基础:
Task: "T018 [P] 创建 JWT 认证中间件"
Task: "T019 [P] 创建通用异常处理器"
Task: "T022 [P] 创建前端 API 客户端"
Task: "T023 [P] 创建前端通用 UI 组件"
Task: "T024 [P] 创建前端布局组件"
```

### Phase 4 并行任务组

```bash
# 并行创建监控相关 API:
Task: "T045 [P] [US1] 实现获取监控列表 API"
Task: "T046 [P] [US1] 实现获取监控详情 API"
Task: "T047 [P] [US1] 实现更新监控任务 API"
Task: "T048 [P] [US1] 实现删除监控任务 API"
Task: "T049 [P] [US1] 实现暂停/恢复监控 API"
```

---

## 实现策略

### MVP 优先 (仅用户故事 1-2)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (**关键 - 阻塞所有故事**)
3. 完成 Phase 3: US4 认证
4. 完成 Phase 4: US1 监控
5. **停止并验证**: 用户可以注册、登录、添加监控任务
6. 完成 Phase 5: US2 通知
7. **MVP 完成**: 系统可以检测变更并发送通知

### 增量交付

1. Setup + Foundational → 基础设施就绪
2. 添加 US4 认证 → 独立测试 → 可演示登录
3. 添加 US1 监控 → 独立测试 → 可演示添加监控
4. 添加 US2 通知 → 独立测试 → **MVP 可交付**
5. 添加 US3 历史 → 独立测试 → 增强功能
6. 添加 US5 渠道 → 独立测试 → 增强功能
7. 添加 US6 引导 → 独立测试 → 体验优化
8. 每个故事独立增加价值，不影响之前的功能

---

## 备注

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事
- 每个用户故事应可独立完成和测试
- 每个任务或逻辑组完成后提交
- 在任何检查点停止以独立验证故事
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖
