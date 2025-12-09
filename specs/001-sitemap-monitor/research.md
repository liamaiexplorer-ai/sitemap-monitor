# 技术研究: Sitemap 变更监控系统

**功能**: 001-sitemap-monitor
**日期**: 2025-12-04
**状态**: 完成

## 研究摘要

本文档记录了 Sitemap 变更监控系统的技术选型研究和决策。

---

## 1. 后端框架选择

### 决策: FastAPI

**理由**:
- 原生异步支持，适合 I/O 密集型的 Sitemap 获取任务
- 自动生成 OpenAPI 文档，便于前后端协作
- Pydantic 集成提供强类型验证
- 性能优秀，满足高并发需求
- 社区活跃，生态丰富

**备选方案**:
| 框架 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| Django | 成熟稳定，ORM 强大 | 异步支持较弱，较重 | 不适合 |
| Flask | 轻量灵活 | 需要额外配置异步，无自动文档 | 不适合 |
| Starlette | 轻量高性能 | 功能较少，需要更多手动配置 | FastAPI 基于此 |

---

## 2. Sitemap 解析策略

### 决策: lxml + iterparse 流式解析

**理由**:
- `iterparse` 支持流式解析，内存占用恒定
- 处理 10 万+ URL 的大型 Sitemap 不会 OOM
- 性能优于 xml.etree.ElementTree
- 支持 XPath 查询

**实现要点**:
```python
from lxml import etree

def parse_sitemap_stream(content: bytes):
    """流式解析 Sitemap，内存友好"""
    context = etree.iterparse(
        io.BytesIO(content),
        events=('end',),
        tag='{http://www.sitemaps.org/schemas/sitemap/0.9}url'
    )
    for event, elem in context:
        url = elem.findtext('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
        lastmod = elem.findtext('{http://www.sitemaps.org/schemas/sitemap/0.9}lastmod')
        yield {'url': url, 'lastmod': lastmod}
        elem.clear()  # 释放内存
```

**备选方案**:
| 库 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| xml.etree | 标准库，无依赖 | 性能较差 | 不适合大文件 |
| BeautifulSoup | API 友好 | 不支持流式，内存占用高 | 不适合 |
| xmltodict | 简单易用 | 一次性加载，内存占用高 | 不适合 |

---

## 3. HTTP 客户端选择

### 决策: httpx

**理由**:
- 支持 HTTP/2，提升并发性能
- 原生异步支持 (AsyncClient)
- 内置重试、超时配置
- API 与 requests 兼容，易于迁移

**配置示例**:
```python
import httpx

async def fetch_sitemap(url: str) -> bytes:
    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        http2=True
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.content
```

**备选方案**:
| 库 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| requests | 广泛使用，文档完善 | 不支持异步 | 不适合 |
| aiohttp | 成熟的异步库 | API 较复杂 | 可选 |
| urllib3 | 底层灵活 | 太底层，需要更多封装 | 不适合 |

---

## 4. 任务队列选择

### 决策: Celery + Redis

**理由**:
- 成熟稳定，生产环境验证
- 支持定时任务 (Celery Beat)
- 内置重试机制，符合宪法要求
- 支持任务优先级和路由
- Redis 可同时作为缓存使用

**配置示例**:
```python
from celery import Celery
from celery.schedules import crontab

app = Celery('sitemap_monitor', broker='redis://localhost:6379/0')

@app.task(bind=True, max_retries=3, default_retry_delay=60)
def check_sitemap(self, monitor_id: int):
    try:
        # 检查逻辑
        pass
    except Exception as exc:
        raise self.retry(exc=exc)

app.conf.beat_schedule = {
    'check-sitemaps-hourly': {
        'task': 'tasks.check_all_sitemaps',
        'schedule': crontab(minute=0),  # 每小时执行
    },
}
```

**备选方案**:
| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| APScheduler | 轻量，无外部依赖 | 单进程，不支持分布式 | 小规模可用 |
| Dramatiq | 现代 API，类型友好 | 生态不如 Celery | 可选 |
| cron + 脚本 | 简单 | 无重试，难以监控 | 不适合 |

---

## 5. 数据库选择

### 决策: PostgreSQL

**理由**:
- JSONB 支持，适合存储 Sitemap URL 列表
- 性能优秀，支持复杂查询
- 成熟稳定，运维成本低
- 支持全文搜索（未来可能需要）

**表设计考虑**:
- 使用 JSONB 存储变更详情，避免过度规范化
- 使用索引优化常见查询（按用户、按时间）
- 分区表处理历史数据（未来优化）

**备选方案**:
| 数据库 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| MySQL | 广泛使用 | JSON 支持不如 PostgreSQL | 可选 |
| SQLite | 无依赖，开发简单 | 不支持并发写入 | 仅开发环境 |
| MongoDB | 文档模型灵活 | 事务支持较弱 | 不适合 |

---

## 6. 前端框架选择

### 决策: React + TailwindCSS + React Query

**理由**:
- React: 生态丰富，社区活跃，易于招聘
- TailwindCSS: 快速开发，响应式设计简单
- React Query: 服务端状态管理，自动缓存和重试

**备选方案**:
| 框架 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| Vue | 学习曲线平缓 | 生态略小于 React | 可选 |
| Svelte | 编译时优化，包体积小 | 生态较小 | 不适合 |
| Next.js | SSR 支持 | 对于此项目过于复杂 | 不需要 |

---

## 7. 认证方案

### 决策: JWT + HTTPOnly Cookie

**理由**:
- JWT: 无状态，易于扩展
- HTTPOnly Cookie: 防止 XSS 攻击
- 配合 CSRF Token 防止 CSRF 攻击

**实现要点**:
- Access Token: 15 分钟过期，存储在内存
- Refresh Token: 7 天过期，存储在 HTTPOnly Cookie
- 密码使用 bcrypt 哈希

**备选方案**:
| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| Session | 简单，服务端控制 | 需要 Session 存储 | 可选 |
| OAuth2 | 标准化 | 对于简单应用过于复杂 | 未来可扩展 |

---

## 8. 通知系统设计

### 决策: 策略模式 + 插件架构

**理由**:
- 策略模式支持多种通知方式（邮件、Webhook）
- 插件架构便于未来扩展（Slack、钉钉等）
- 每种通知类型独立实现，易于测试

**实现要点**:
```python
from abc import ABC, abstractmethod

class NotificationChannel(ABC):
    @abstractmethod
    async def send(self, change_record: ChangeRecord) -> bool:
        pass

class EmailChannel(NotificationChannel):
    async def send(self, change_record: ChangeRecord) -> bool:
        # 发送邮件
        pass

class WebhookChannel(NotificationChannel):
    async def send(self, change_record: ChangeRecord) -> bool:
        # 发送 Webhook
        pass
```

---

## 9. 变更检测算法

### 决策: 基于 URL 的集合比较

**算法**:
1. 获取新旧快照的 URL 集合
2. 新增 = 新集合 - 旧集合
3. 删除 = 旧集合 - 新集合
4. 修改 = 交集中 lastmod 不同的 URL

**实现要点**:
```python
def detect_changes(old_snapshot: dict, new_snapshot: dict) -> ChangeRecord:
    old_urls = set(old_snapshot.keys())
    new_urls = set(new_snapshot.keys())

    added = new_urls - old_urls
    removed = old_urls - new_urls

    modified = {
        url for url in (old_urls & new_urls)
        if old_snapshot[url]['lastmod'] != new_snapshot[url]['lastmod']
    }

    return ChangeRecord(added=added, removed=removed, modified=modified)
```

**性能考虑**:
- 使用 set 操作，时间复杂度 O(n)
- 10 万 URL 的比较在毫秒级完成

---

## 10. 部署方案

### 决策: Docker Compose (开发) + Kubernetes (生产)

**开发环境**:
```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [db, redis]
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  db:
    image: postgres:15
  redis:
    image: redis:7
  celery-worker:
    build: ./backend
    command: celery -A sitemap_monitor worker
  celery-beat:
    build: ./backend
    command: celery -A sitemap_monitor beat
```

**生产环境考虑**:
- Kubernetes 部署，支持水平扩展
- 使用托管数据库（如 RDS）
- 使用 CDN 加速前端资源

---

## 总结

所有技术选型均已完成，无待澄清项。技术栈符合项目宪法要求，能够满足性能目标和可靠性要求。
