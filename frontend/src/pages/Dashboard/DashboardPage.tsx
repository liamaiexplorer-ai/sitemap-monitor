import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardHeader } from "@/components/UI";
import { OnboardingModal } from "@/components/Onboarding";
import { ChangeDetailModal } from "@/components/Changes";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { dashboardApi, RecentChange } from "@/services/dashboard";
import { Activity, ArrowRight, ArrowUpRight, Clock, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/UI/Button";
import { cn } from "@/utils/cn";

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { openModal, hasSkipped } = useOnboardingStore();
  const [selectedChange, setSelectedChange] = useState<RecentChange | null>(null);

  // Fetch stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60000,
  });

  // Onboarding check
  useEffect(() => {
    if (user && !user.has_completed_onboarding && !hasSkipped) {
      openModal();
    }
  }, [user, hasSkipped, openModal]);

  const handleAddMonitor = () => {
    navigate("/monitors?action=add");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('common.dashboard')}</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.welcome')}</p>
        </div>
        <Button onClick={handleAddMonitor} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          {t('dashboard.new_monitor')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-24 h-24 text-indigo-600" />
          </div>
          <CardHeader title={t('dashboard.active_monitors')} description={t('dashboard.active_monitors_desc')} />
          <div className="text-4xl font-bold text-slate-900 mt-2">
            {isLoading ? "-" : stats?.active_monitors ?? 0}
          </div>
          <div className="mt-4 text-sm text-indigo-600 font-medium flex items-center cursor-pointer hover:underline" onClick={() => navigate('/monitors')}>
            {t('dashboard.view_all')} <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Card>

        <Card className="border-indigo-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-24 h-24 text-emerald-600" />
          </div>
          <CardHeader title={t('dashboard.changes_today')} description={t('dashboard.changes_today_desc')} />
          <div className="text-4xl font-bold text-slate-900 mt-2">
            {isLoading ? "-" : stats?.today_changes ?? 0}
          </div>
          <div className={cn(
            "mt-4 text-sm font-medium flex items-center",
            (stats?.error_monitors ?? 0) > 0 ? "text-red-600" : "text-emerald-600"
          )}>
            {(stats?.error_monitors ?? 0) > 0
              ? `${stats?.error_monitors} ${t('common.monitors')} ${t('status.error')}`
              : t('dashboard.all_good')
            }
          </div>
        </Card>
      </div>

      <Card className="border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <CardHeader title={t('dashboard.recent_changes')} description={t('dashboard.recent_changes_desc')} />
          <Button variant="ghost" size="sm" onClick={() => navigate('/monitors')} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            {t('dashboard.view_all')}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-slate-500 text-center py-12 flex flex-col items-center">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
            {t('dashboard.loading')}
          </div>
        ) : stats?.recent_changes && stats.recent_changes.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {stats.recent_changes.map((change) => (
              <div
                key={change.id}
                className="py-4 flex justify-between items-center group cursor-pointer hover:bg-slate-50 -mx-6 px-6 transition-colors"
                onClick={() => setSelectedChange(change)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm border border-slate-200 transition-all">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">{change.monitor_name}</div>
                    <div className="text-sm text-slate-500">
                      {new Date(change.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-right flex items-center gap-3">
                  <div className="flex gap-2">
                    {change.added_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                        +{change.added_count} {t('dashboard.added')}
                      </span>
                    )}
                    {change.removed_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        -{change.removed_count} {t('dashboard.removed')}
                      </span>
                    )}
                    {change.modified_count > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-100">
                        ~{change.modified_count} {t('dashboard.modified')}
                      </span>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <p>{t('dashboard.no_changes')}</p>
          </div>
        )}
      </Card>

      {selectedChange && (
        <ChangeDetailModal
          isOpen={!!selectedChange}
          onClose={() => setSelectedChange(null)}
          monitorId={selectedChange.monitor_task_id}
          changeId={selectedChange.id}
        />
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        onAddMonitor={handleAddMonitor}
      />
    </div>
  );
}
