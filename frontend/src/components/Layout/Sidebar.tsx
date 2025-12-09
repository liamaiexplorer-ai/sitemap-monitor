import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, X, Globe, LogOut } from "lucide-react";
import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from "@/stores/authStore";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const navigation = [
    { name: t('common.dashboard'), href: "/dashboard", icon: LayoutDashboard },
    { name: t('common.monitors'), href: "/monitors", icon: Activity },
    // { name: t('common.sitemaps'), href: "/sitemaps", icon: Map },
    // { name: t('common.settings'), href: "/settings", icon: Settings },
  ];

  const sidebarVariants = {
    hidden: { x: -264, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    },
    exit: {
      x: -264,
      opacity: 0,
      transition: {
        ease: "easeInOut",
        duration: 0.3
      }
    }
  };

  const navItemVariants = {
    hover: { scale: 1.02, x: 4 },
    tap: { scale: 0.98 }
  };

  const sidebarContent = (
    <div className="flex flex-col flex-grow h-full bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl">
      {/* Brand */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center font-display font-bold text-white shadow-inner">
              SM
            </div>
          </div>
          <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-900 to-indigo-900 dark:from-white dark:to-white/80">
            SitemapMonitor
          </span>
        </Link>

        {onMobileClose && (
          <button
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-white/10 hover:text-slate-700 transition-colors"
            onClick={onMobileClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <div className="mb-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
          {t('common.platform')}
        </div>

        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onMobileClose}
            >
              <motion.div
                variants={navItemVariants}
                whileHover="hover"
                whileTap="tap"
                className={cn(
                  "relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
                  isActive
                    ? "text-white shadow-lg shadow-violet-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 relative z-10 transition-colors duration-300",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-violet-600"
                  )}
                />
                <span className="relative z-10">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}

        <div className="mt-8 mb-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider font-display">
          {t('common.resources')}
        </div>
        <a href="https://github.com/liamaiexplorer-ai/sitemap-monitor.git" target="_blank" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/40 transition-all duration-300 group">
          <Globe className="mr-3 h-5 w-5 text-slate-500 group-hover:text-violet-600 transition-colors" />
          {t('common.documentation')}
        </a>
        <a href="mailto:liamaiexplorer@gmail.com" className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/40 transition-all duration-300 group">
          <svg className="mr-3 h-5 w-5 text-slate-500 group-hover:text-violet-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          {t('common.support', 'Support')}
        </a>
      </nav>

      {/* User Info / Logout could go here */}
      <div className="p-4 border-t border-white/10">
        {user ? (
          <div className="glass-panel p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-30 m-4 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <motion.div
              variants={sidebarVariants as any}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              <div className="h-full bg-white/80 backdrop-blur-2xl shadow-2xl">
                {sidebarContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
