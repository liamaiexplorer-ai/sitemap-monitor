# Sitemap Monitor

[English](README.md) | [中文](README_ZH.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**Sitemap Monitor** is an open-source, powerful SaaS solution for tracking, analyzing, and optimizing your website's sitemaps. Built for developers and SEO professionals.


## ✨ Features

- 📡 **Real-time Monitoring**: Automatically scan sitemap URLs for changes.
- 🔔 **Instant Alerts**: Get notified via Email, Slack, or Webhook when changes occur.
- 📊 **Change Analytics**: visualize growth/shrinkage trends over time.
- 🔍 **Health Checks**: Validate URLs for 404s and response codes.
- ⚡ **Modern Dashboard**: A beautiful, intuitive interface built with React & Tailwind.
- 🐳 **Docker Ready**: Deploy in minutes with Docker Compose.

## 🛠 Tech Stack

**Backend**
- Python 3.11+, FastAPI
- PostgreSQL (Async), SQLAlchemy
- Redis, Celery (Task Queue)

**Frontend**
- React 18, TypeScript, Vite
- TailwindCSS, Framer Motion
- Lucide React (Icons)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Run with Docker

```bash
# Clone the repository
git clone https://github.com/your-username/sitemap-monitor.git
cd sitemap-monitor

# Start all services
docker-compose up -d

# Access the app
# Frontend: http://localhost:80
# Backend API: http://localhost:8000/docs
```

## 💻 Local Development

### Backend Setup

```bash
cd backend
pip install -e .
# Start DB & Redis via Docker first
# Terminal 1: API Server
uvicorn sitemap_monitor.main:app --reload

# Terminal 2: Celery Worker
celery -A sitemap_monitor.tasks worker --loglevel=info

# Terminal 3: Celery Beat (Scheduler)
celery -A sitemap_monitor.tasks beat --loglevel=info
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please check out our [Contributing Guide](CONTRIBUTING.md) for guidelines on how to proceed.

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).
