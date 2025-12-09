# 数据模型: Sitemap 变更监控系统

**功能**: 001-sitemap-monitor
**日期**: 2025-12-04

## 实体关系图

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    User     │───1:N─│   MonitorTask    │───1:N─│ SitemapSnapshot │
└─────────────┘       └──────────────────┘       └─────────────────┘
       │                      │                          │
       │                      │                          │
       │1:N                   │N:M                       │1:N
       ▼                      ▼                          ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐
│NotificationChannel  │  │MonitorTaskChannel   │  │ChangeRecord  │
└─────────────────────┘  │    (关联表)          │  └──────────────┘
       │                 └─────────────────────┘
       │1:N
       ▼
┌─────────────────┐
│NotificationLog  │
└─────────────────┘
```

---

## 实体定义

### User (用户)

系统的使用者，可以管理监控任务和通知配置。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱地址，用于登录 |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 哈希后的密码 |
| is_active | BOOLEAN | DEFAULT true | 账号是否激活 |
| is_verified | BOOLEAN | DEFAULT false | 邮箱是否已验证 |
| has_completed_onboarding | BOOLEAN | DEFAULT false | 是否完成新手引导 |
| created_at | TIMESTAMP | NOT NULL | 注册时间 |
| updated_at | TIMESTAMP | NOT NULL | 最后更新时间 |
| last_login_at | TIMESTAMP | NULLABLE | 最后登录时间 |

**索引**:
- `idx_user_email` ON email

---

### MonitorTask (监控任务)

代表一个被监控的 Sitemap。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User.id, NOT NULL | 所属用户 |
| name | VARCHAR(255) | NOT NULL | 任务名称（用户自定义） |
| sitemap_url | VARCHAR(2048) | NOT NULL | Sitemap URL |
| check_interval_minutes | INTEGER | DEFAULT 60 | 检查间隔（分钟），范围 15-1440 |
| status | ENUM | NOT NULL | 状态：active/paused/error |
| last_check_at | TIMESTAMP | NULLABLE | 最后检查时间 |
| last_error | TEXT | NULLABLE | 最后一次错误信息 |
| error_count | INTEGER | DEFAULT 0 | 连续错误次数 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 最后更新时间 |

**状态枚举**:
- `active`: 正常监控中
- `paused`: 用户暂停
- `error`: 连续多次检查失败

**约束**:
- 同一用户不能添加相同的 sitemap_url
- check_interval_minutes 范围：15 ~ 1440

**索引**:
- `idx_monitor_user` ON user_id
- `idx_monitor_status` ON status
- `idx_monitor_next_check` ON (status, last_check_at) WHERE status = 'active'

---

### SitemapSnapshot (Sitemap 快照)

某次检查时 Sitemap 的完整内容记录。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| monitor_task_id | UUID | FK → MonitorTask.id, NOT NULL | 所属监控任务 |
| url_count | INTEGER | NOT NULL | URL 总数 |
| url_hash | VARCHAR(64) | NOT NULL | URL 列表的 SHA256 哈希（用于快速比较） |
| urls | JSONB | NOT NULL | URL 详情列表 [{url, lastmod, changefreq, priority}] |
| fetch_duration_ms | INTEGER | NOT NULL | 获取耗时（毫秒） |
| parse_duration_ms | INTEGER | NOT NULL | 解析耗时（毫秒） |
| created_at | TIMESTAMP | NOT NULL | 检查时间 |

**JSONB 结构示例**:
```json
[
  {"url": "https://example.com/page1", "lastmod": "2025-01-01", "changefreq": "daily", "priority": "0.8"},
  {"url": "https://example.com/page2", "lastmod": "2025-01-02", "changefreq": "weekly", "priority": "0.5"}
]
```

**索引**:
- `idx_snapshot_monitor` ON monitor_task_id
- `idx_snapshot_created` ON created_at

**数据保留**: 90 天后自动清理

---

### ChangeRecord (变更记录)

两次快照之间的差异记录。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| monitor_task_id | UUID | FK → MonitorTask.id, NOT NULL | 所属监控任务 |
| old_snapshot_id | UUID | FK → SitemapSnapshot.id, NULLABLE | 旧快照（首次为空） |
| new_snapshot_id | UUID | FK → SitemapSnapshot.id, NOT NULL | 新快照 |
| change_type | ENUM | NOT NULL | 变更类型 |
| added_count | INTEGER | DEFAULT 0 | 新增 URL 数量 |
| removed_count | INTEGER | DEFAULT 0 | 删除 URL 数量 |
| modified_count | INTEGER | DEFAULT 0 | 修改 URL 数量 |
| changes | JSONB | NOT NULL | 变更详情 |
| created_at | TIMESTAMP | NOT NULL | 变更检测时间 |

**变更类型枚举**:
- `initial`: 首次检查
- `no_change`: 无变更
- `changed`: 有变更

**JSONB 结构示例**:
```json
{
  "added": [
    {"url": "https://example.com/new-page", "lastmod": "2025-01-03"}
  ],
  "removed": [
    {"url": "https://example.com/old-page"}
  ],
  "modified": [
    {"url": "https://example.com/page1", "old_lastmod": "2025-01-01", "new_lastmod": "2025-01-03"}
  ]
}
```

**索引**:
- `idx_change_monitor` ON monitor_task_id
- `idx_change_created` ON created_at
- `idx_change_type` ON change_type WHERE change_type = 'changed'

---

### NotificationChannel (通知渠道)

用户配置的通知方式。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| user_id | UUID | FK → User.id, NOT NULL | 所属用户 |
| name | VARCHAR(255) | NOT NULL | 渠道名称（用户自定义） |
| channel_type | ENUM | NOT NULL | 渠道类型 |
| config | JSONB | NOT NULL | 渠道配置 |
| is_active | BOOLEAN | DEFAULT true | 是否启用 |
| last_test_at | TIMESTAMP | NULLABLE | 最后测试时间 |
| last_test_success | BOOLEAN | NULLABLE | 最后测试是否成功 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 最后更新时间 |

**渠道类型枚举**:
- `email`: 邮件通知
- `webhook`: Webhook 通知

**配置 JSONB 结构**:

Email:
```json
{
  "email": "user@example.com"
}
```

Webhook:
```json
{
  "url": "https://hooks.example.com/notify",
  "headers": {"Authorization": "Bearer xxx"},
  "method": "POST"
}
```

**索引**:
- `idx_channel_user` ON user_id

---

### MonitorTaskChannel (监控任务-通知渠道关联)

监控任务与通知渠道的多对多关联。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| monitor_task_id | UUID | FK → MonitorTask.id, PK | 监控任务 |
| channel_id | UUID | FK → NotificationChannel.id, PK | 通知渠道 |
| created_at | TIMESTAMP | NOT NULL | 关联创建时间 |

**约束**:
- 复合主键 (monitor_task_id, channel_id)

---

### NotificationLog (通知日志)

已发送通知的记录。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 主键 |
| channel_id | UUID | FK → NotificationChannel.id, NOT NULL | 通知渠道 |
| change_record_id | UUID | FK → ChangeRecord.id, NOT NULL | 变更记录 |
| status | ENUM | NOT NULL | 发送状态 |
| error_message | TEXT | NULLABLE | 错误信息（如果失败） |
| sent_at | TIMESTAMP | NOT NULL | 发送时间 |
| response_code | INTEGER | NULLABLE | HTTP 响应码（Webhook） |
| retry_count | INTEGER | DEFAULT 0 | 重试次数 |

**状态枚举**:
- `pending`: 待发送
- `sent`: 已发送
- `failed`: 发送失败

**索引**:
- `idx_notification_channel` ON channel_id
- `idx_notification_change` ON change_record_id
- `idx_notification_status` ON status

---

## 状态转换

### MonitorTask 状态机

```
                 ┌─────────────────────────────────────┐
                 │                                     │
                 ▼                                     │
┌────────┐   创建   ┌────────┐   暂停   ┌────────┐   │
│ (新建) │ ────────▶│ active │ ────────▶│ paused │   │
└────────┘          └────────┘          └────────┘   │
                         │                   │        │
                         │ 连续3次失败        │ 恢复   │
                         ▼                   │        │
                    ┌────────┐               │        │
                    │ error  │───────────────┘        │
                    └────────┘                        │
                         │                            │
                         │ 用户手动重试/修复URL        │
                         └────────────────────────────┘
```

---

## 数据保留策略

| 实体 | 保留时间 | 清理策略 |
|------|---------|---------|
| User | 永久 | 用户主动删除账号时级联删除 |
| MonitorTask | 永久 | 用户删除时软删除 |
| SitemapSnapshot | 90 天 | 定时任务每日清理 |
| ChangeRecord | 90 天 | 定时任务每日清理 |
| NotificationLog | 30 天 | 定时任务每日清理 |
