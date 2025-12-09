import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader } from "@/components/UI";
import { OnboardingModal } from "@/components/Onboarding";
import { ChangeDetailModal } from "@/components/Changes";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { dashboardApi, RecentChange } from "@/services/dashboard";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { openModal, hasSkipped } = useOnboardingStore();
  const [selectedChange, setSelectedChange] = useState<RecentChange | null>(null);

  // 获取仪表盘统计数据
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60000, // 每分钟刷新一次
  });

  // 首次登录且未完成引导时显示引导弹窗
  useEffect(() => {
    if (user && !user.has_completed_onboarding && !hasSkipped) {
      openModal();
    }
  }, [user, hasSkipped, openModal]);

  const handleAddMonitor = () => {
    navigate("/monitors?action=add");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="监控任务" description="活跃的监控数量" />
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "-" : stats?.active_monitors ?? 0}
          </div>
        </Card>

        <Card>
          <CardHeader title="今日变更" description="检测到的变更数量" />
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "-" : stats?.today_changes ?? 0}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="最近变更" description="最近检测到的 Sitemap 变更，点击查看详情" />
        {isLoading ? (
          <div className="text-gray-500 text-center py-8">加载中...</div>
        ) : stats?.recent_changes && stats.recent_changes.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {stats.recent_changes.map((change) => (
              <div
                key={change.id}
                className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 -mx-4 px-4"
                onClick={() => setSelectedChange(change)}
              >
                <div>
                  <div className="font-medium text-gray-900">{change.monitor_name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(change.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-right flex items-center gap-2">
                  <span>
                    {change.added_count > 0 && (
                      <span className="text-green-600">+{change.added_count} </span>
                    )}
                    {change.removed_count > 0 && (
                      <span className="text-red-600">-{change.removed_count} </span>
                    )}
                    {change.modified_count > 0 && (
                      <span className="text-yellow-600">~{change.modified_count}</span>
                    )}
                  </span>
                  <span className="text-gray-400 text-xs">点击查看</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">暂无变更记录</div>
        )}
      </Card>

      {/* 变更详情弹窗 */}
      {selectedChange && (
        <ChangeDetailModal
          isOpen={!!selectedChange}
          onClose={() => setSelectedChange(null)}
          monitorId={selectedChange.monitor_task_id}
          changeId={selectedChange.id}
        />
      )}

      {/* 新手引导弹窗 */}
      <OnboardingModal
        onAddMonitor={handleAddMonitor}
      />
    </div>
  );
}
