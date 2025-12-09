<!--
==========================================================================
SYNC IMPACT REPORT
==========================================================================
Version Change: N/A → 1.0.0 (Initial version)
Modified Principles: N/A (Initial creation)
Added Sections:
  - Core Principles (7 principles)
  - Technical Standards
  - Development Workflow
  - Governance
Removed Sections: N/A
Templates Status:
  - .specify/templates/plan-template.md: ✅ Compatible (no changes needed)
  - .specify/templates/spec-template.md: ✅ Compatible (no changes needed)
  - .specify/templates/tasks-template.md: ✅ Compatible (no changes needed)
  - .specify/templates/checklist-template.md: ✅ Compatible (no changes needed)
  - .specify/templates/agent-file-template.md: ✅ Compatible (no changes needed)
Follow-up TODOs: None
==========================================================================
-->

# Sitemap Monitor 项目宪法

## 核心原则

### I. 可靠性优先

监控系统的核心价值在于可靠性。所有设计决策 MUST 优先考虑数据准确性和服务稳定性。

**要求**：
- 网络请求 MUST 实现重试机制（至少 3 次，指数退避）
- 所有外部依赖（HTTP 请求、文件 I/O）MUST 有超时控制
- 异常处理 MUST 完整覆盖，禁止静默失败
- 监控数据 MUST 持久化，支持故障恢复

**理由**：作为监控工具，自身的可靠性是用户信任的基础。

### II. 性能高效

Sitemap 文件可能包含数万 URL，系统 MUST 高效处理大规模数据。

**要求**：
- XML 解析 MUST 使用流式处理，禁止一次性加载整个文件到内存
- 并发请求 MUST 使用异步 I/O（asyncio）
- 批量操作 MUST 支持分批处理，避免内存溢出
- 性能目标：处理 10 万 URL 的 Sitemap 耗时 SHOULD < 60 秒

**理由**：真实场景下 Sitemap 规模差异巨大，性能设计决定了工具的适用范围。

### III. CLI 优先

主要交互方式为命令行，遵循 Unix 哲学。

**要求**：
- 所有功能 MUST 通过 CLI 暴露
- 输入输出 MUST 支持 stdin/stdout 管道
- 输出格式 MUST 支持 JSON 和人类可读两种模式
- 错误信息 MUST 输出到 stderr
- 命令 MUST 支持 `--help` 和 `--version`

**理由**：CLI 工具便于集成到自动化流程、定时任务和 CI/CD 管道中。

### IV. 配置简洁

用户配置 MUST 遵循"合理默认 + 最小配置"原则。

**要求**：
- 所有配置项 MUST 有合理的默认值
- 配置文件 MUST 使用 YAML 格式
- 命令行参数 SHOULD 能覆盖配置文件设置
- 敏感信息 MUST 支持环境变量注入
- 配置验证 MUST 在启动时完成，提供明确错误提示

**理由**：降低使用门槛，让用户快速上手。

### V. 可观测性

系统运行状态 MUST 可追踪、可调试。

**要求**：
- 日志 MUST 使用结构化格式（JSON）
- 日志级别 MUST 支持 DEBUG/INFO/WARNING/ERROR
- 关键操作 MUST 记录：请求发起、响应接收、解析结果、变更检测
- 长时间任务 MUST 输出进度信息
- 错误日志 MUST 包含足够的上下文信息用于问题定位

**理由**：监控工具的可调试性直接影响问题排查效率。

### VI. 代码质量

代码 MUST 保持简洁、可维护。

**要求**：
- 模块职责 MUST 单一且明确
- 公共 API MUST 有类型注解（Type Hints）
- 圈复杂度 SHOULD < 10
- 代码复用优先于重复
- 测试覆盖率 SHOULD > 80%（核心模块）
- 禁止过度设计：只实现当前需求，不预留"可能有用"的抽象

**理由**：简洁的代码更容易维护和迭代。

### VII. 增量交付

功能开发 MUST 遵循增量交付原则。

**要求**：
- 每个功能 MUST 可独立测试和部署
- 变更 MUST 向后兼容，破坏性变更需要版本号升级
- 每次提交 SHOULD 是一个完整的、可工作的状态
- 大功能 MUST 拆分为多个小任务，逐步实现

**理由**：增量交付降低风险，便于快速验证和反馈。

## 技术标准

### 技术栈

- **语言**：Python 3.11+
- **HTTP 客户端**：httpx（支持 HTTP/2 和异步）
- **XML 解析**：lxml（流式解析用 iterparse）
- **CLI 框架**：click 或 typer
- **配置管理**：pydantic-settings
- **测试框架**：pytest + pytest-asyncio
- **代码格式**：ruff（lint + format）

### 项目结构

```text
src/
├── sitemap_monitor/
│   ├── __init__.py
│   ├── cli/           # CLI 命令定义
│   ├── core/          # 核心业务逻辑
│   ├── parsers/       # Sitemap 解析器
│   ├── storage/       # 数据持久化
│   └── utils/         # 通用工具
tests/
├── unit/
├── integration/
└── conftest.py
```

### 依赖管理

- 依赖 MUST 使用 `pyproject.toml` 管理
- 开发依赖 MUST 与运行时依赖分离
- 依赖更新 SHOULD 使用 Dependabot 或类似工具自动化

## 开发工作流

### 代码审查

- 所有代码变更 MUST 通过 Pull Request 提交
- PR MUST 包含清晰的描述和变更理由
- CI 检查 MUST 通过后才能合并

### 测试要求

- 新功能 MUST 有对应的测试用例
- Bug 修复 MUST 先写失败的测试，再修复
- 集成测试 SHOULD 覆盖关键用户场景

### 发布流程

- 版本号 MUST 遵循语义化版本（SemVer）
- 发布前 MUST 更新 CHANGELOG
- 发布 MUST 有对应的 Git Tag

## 治理

### 宪法修订

- 宪法修订 MUST 通过 Pull Request 进行
- 重大修订（新增/删除原则）MUST 有明确的理由说明
- 修订生效后，相关模板和文档 MUST 同步更新

### 版本策略

- **MAJOR**：治理原则的删除或不兼容重定义
- **MINOR**：新增原则或重大扩展现有指导
- **PATCH**：措辞澄清、错误修正、非语义性调整

### 合规检查

- 每次 PR SHOULD 检查是否符合宪法原则
- 代码审查 SHOULD 包含宪法合规性验证
- 如有原则冲突，MUST 在 PR 中明确说明并获得批准

**版本**: 1.0.0 | **批准日期**: 2025-12-04 | **最后修订**: 2025-12-04
