# Sitemap Monitor

[English](README.md) | [中文](README_ZH.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**Sitemap Monitor** 是一个开源、强大的 SaaS 解决方案，用于跟踪、分析和优化您网站的 Sitemap。专为开发者和 SEO 专业人士打造。

## ✨ 功能特性

- 📡 **实时监控**：自动扫描 Sitemap URL 的变动。
- 🔔 **即时通知**：当发生变动时，通过邮件、Slack 或 Webhook 获取通知。
- 📊 **变更分析**：可视化随时间推移的增长/收缩趋势。
- 🔍 **健康检查**：验证 URL 的 404 状态和响应代码。
- ⚡ **现代仪表板**：使用 React & Tailwind 构建的美观、直观的界面。
- 🐳 **Docker 就绪**：使用 Docker Compose 分分钟部署。

## 🛠 技术栈

**后端**
- Python 3.11+, FastAPI
- PostgreSQL (Async), SQLAlchemy
- Redis, Celery (任务队列)

**前端**
- React 18, TypeScript, Vite
- TailwindCSS, Framer Motion
- Lucide React (图标)

## 🚀 快速开始

### 前置条件
- Docker & Docker Compose

### 使用 Docker 运行

```bash
# 克隆仓库
git clone https://github.com/your-username/sitemap-monitor.git
cd sitemap-monitor

# 启动所有服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:80
# 后端 API: http://localhost:8000/docs
```

## 💻 本地开发

### 后端设置

```bash
cd backend
pip install -e .
# 请先通过 Docker 启动 DB & Redis
# 终端 1: API 服务
uvicorn sitemap_monitor.main:app --reload

# 终端 2: Celery Worker
celery -A sitemap_monitor.tasks worker --loglevel=info

# 终端 3: Celery Beat (调度器)
celery -A sitemap_monitor.tasks beat --loglevel=info
```

### 前端设置

```bash
cd frontend
npm install
npm run dev
```

## 🤝 贡献

欢迎贡献！请查看我们的 [贡献指南](CONTRIBUTING.md) 了解如何开始。

## 📄 许可证

本项目是开源软件，基于 [MIT license](LICENSE) 许可。
