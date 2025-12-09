import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, X, Globe, Settings, Map } from "lucide-react";
import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    { name: t('common.dashboard'), href: "/dashboard", icon: LayoutDashboard },
    { name: t('common.monitors'), href: "/monitors", icon: Activity },
    // { name: t('common.sitemaps'), href: "/sitemaps", icon: Map },
    // { name: t('common.settings'), href: "/settings", icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col flex-grow bg-slate-900 h-full text-white">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">S</div>
          <span className="text-lg font-bold">SitemapMonitor</span>
        </Link>

        {/* Mobile Close Button */}
        {onMobileClose && (
          <button
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={onMobileClose}
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t('common.platform')}
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href} // Use href as key since name changes with language
              to={item.href}
              onClick={onMobileClose}
              className={cn(
                "group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {t('common.resources')}
        </div>
        <a href="#" className="group flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <Globe className="mr-3 h-5 w-5 text-slate-500 group-hover:text-white" />
          {t('common.documentation')}
        </a>
      </nav>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col shadow-xl">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-2xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
