import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { OnboardingModal } from "@/components/Onboarding";
import { ChangeDetailModal } from "@/components/Changes";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { dashboardApi, RecentChange } from "@/services/dashboard";
import { Activity, ArrowRight, ArrowUpRight, Clock, Plus, TrendingUp, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/UI/Button";
import { cn } from "@/utils/cn";
import { GlassCard } from "@/components/UI/GlassCard";
import { AnimatedBackground } from "@/components/Layout/AnimatedBackground";
import { motion } from "framer-motion";

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
    <div className="space-y-8 relative">
      <AnimatedBackground />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">{t('common.dashboard')}</h1>
          <p className="text-slate-600 mt-1 font-medium">{t('dashboard.welcome')}</p>
        </div>
        <Button onClick={handleAddMonitor} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6 py-2.5 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          {t('dashboard.new_monitor')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-32 h-32 text-indigo-600 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t('dashboard.active_monitors')}</div>
            <div className="text-5xl font-display font-bold text-slate-900 mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              {isLoading ? "-" : stats?.active_monitors ?? 0}
            </div>
            <div className="text-sm text-slate-600">
              {t('dashboard.active_monitors_desc')}
            </div>
            <div className="mt-6">
              <Button variant="ghost" onClick={() => navigate('/monitors')} className="p-0 h-auto text-indigo-600 hover:text-indigo-800 hover:bg-transparent font-semibold group-hover:translate-x-1 transition-transform">
                {t('dashboard.view_all')} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-32 h-32 text-emerald-600 rotate-12" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{t('dashboard.changes_today')}</div>
            <div className="text-5xl font-display font-bold text-slate-900 mt-2 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              {isLoading ? "-" : stats?.today_changes ?? 0}
            </div>
            <div className="text-sm text-slate-600">
              {t('dashboard.changes_today_desc')}
            </div>
            <div className={cn(
              "mt-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
              (stats?.error_monitors ?? 0) > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
            )}>
              {(stats?.error_monitors ?? 0) > 0 ? (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1.5" />
                  {stats?.error_monitors} {t('status.error')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1.5" />
                  {t('dashboard.all_good')}
                </>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Placeholder for future stat or upsell */}
        <GlassCard className="relative overflow-hidden group flex flex-col justify-center items-center text-center bg-gradient-to-br from-indigo-900/5 to-violet-900/5 border-dashed border-2 border-indigo-200/50">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-400 mb-3 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">{t('dashboard.pro_tips', 'Pro Tips')}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Check your monitors daily to stay ahead of SEO issues.</p>
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100/50 flex items-center justify-between bg-white/30">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              {t('dashboard.recent_changes')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{t('dashboard.recent_changes_desc')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/monitors')} className="text-indigo-600 hover:text-indigo-700 hover:bg-white/50">
            {t('dashboard.view_all')}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-slate-500 text-center py-20 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full mb-4"></div>
            <div className="text-sm font-medium">{t('dashboard.loading')}</div>
          </div>
        ) : stats?.recent_changes && stats.recent_changes.length > 0 ? (
          <div className="divide-y divide-slate-100/50">
            {stats.recent_changes.map((change, index) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={change.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer hover:bg-white/40 transition-colors"
                onClick={() => setSelectedChange(change)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-500 border border-slate-200/50 shadow-sm group-hover:scale-110 group-hover:shadow-md group-hover:text-indigo-600 transition-all duration-300">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-base">{change.monitor_name}</div>
                    <div className="text-xs font-medium text-slate-500">
                      {new Date(change.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="flex gap-2">
                    {change.added_count > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-400/10 text-emerald-700 border border-emerald-400/20">
                        +{change.added_count} {t('dashboard.added')}
                      </span>
                    )}
                    {change.removed_count > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-400/10 text-rose-700 border border-rose-400/20">
                        -{change.removed_count} {t('dashboard.removed')}
                      </span>
                    )}
                    {change.modified_count > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400/10 text-amber-700 border border-amber-400/20">
                        ~{change.modified_count} {t('dashboard.modified')}
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-slate-400 group-hover:text-indigo-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-center py-20 bg-slate-50/50 mx-6 mb-6 rounded-2xl border-2 border-dashed border-slate-200/50">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium">{t('dashboard.no_changes')}</p>
            <p className="text-xs text-slate-400 mt-1">Everything looks quiet for now.</p>
          </div>
        )}
      </GlassCard>

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
