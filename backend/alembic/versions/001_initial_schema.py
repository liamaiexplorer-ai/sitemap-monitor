"""初始数据库架构.

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 用户表
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("is_verified", sa.Boolean(), default=False, nullable=False),
        sa.Column("has_completed_onboarding", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 监控任务表
    op.create_table(
        "monitor_tasks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("sitemap_url", sa.String(2048), nullable=False),
        sa.Column("check_interval_minutes", sa.Integer(), default=60, nullable=False),
        sa.Column("status", sa.String(20), default="active", nullable=False),
        sa.Column("last_check_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("error_count", sa.Integer(), default=0, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 快照表
    op.create_table(
        "sitemap_snapshots",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("monitor_task_id", sa.String(36), sa.ForeignKey("monitor_tasks.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("url_count", sa.Integer(), default=0, nullable=False),
        sa.Column("url_hash", sa.String(64), nullable=False),
        sa.Column("urls", postgresql.JSONB(), nullable=False),
        sa.Column("fetch_duration_ms", sa.Integer(), nullable=True),
        sa.Column("parse_duration_ms", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 变更记录表
    op.create_table(
        "change_records",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("monitor_task_id", sa.String(36), sa.ForeignKey("monitor_tasks.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("old_snapshot_id", sa.String(36), sa.ForeignKey("sitemap_snapshots.id", ondelete="SET NULL"), nullable=True),
        sa.Column("new_snapshot_id", sa.String(36), sa.ForeignKey("sitemap_snapshots.id", ondelete="SET NULL"), nullable=True),
        sa.Column("change_type", sa.String(20), nullable=False),
        sa.Column("added_count", sa.Integer(), default=0, nullable=False),
        sa.Column("removed_count", sa.Integer(), default=0, nullable=False),
        sa.Column("modified_count", sa.Integer(), default=0, nullable=False),
        sa.Column("changes", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 通知渠道表
    op.create_table(
        "notification_channels",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("channel_type", sa.String(20), nullable=False),
        sa.Column("config", postgresql.JSONB(), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True, nullable=False),
        sa.Column("last_test_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_test_success", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # 监控任务-通知渠道关联表
    op.create_table(
        "monitor_task_channels",
        sa.Column("monitor_task_id", sa.String(36), sa.ForeignKey("monitor_tasks.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("channel_id", sa.String(36), sa.ForeignKey("notification_channels.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    # 通知日志表
    op.create_table(
        "notification_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("channel_id", sa.String(36), sa.ForeignKey("notification_channels.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("change_record_id", sa.String(36), sa.ForeignKey("change_records.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("response_code", sa.Integer(), nullable=True),
        sa.Column("retry_count", sa.Integer(), default=0, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("notification_logs")
    op.drop_table("monitor_task_channels")
    op.drop_table("notification_channels")
    op.drop_table("change_records")
    op.drop_table("sitemap_snapshots")
    op.drop_table("monitor_tasks")
    op.drop_table("users")
