import { Link, useLocation } from "react-router-dom";

const navigation = [
  { name: "仪表盘", href: "/dashboard", icon: HomeIcon },
  { name: "监控任务", href: "/monitors", icon: MonitorIcon },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <Link to="/dashboard" className="text-xl font-bold text-gray-900">
          Sitemap Monitor
        </Link>
        {/* 移动端关闭按钮 */}
        {onMobileClose && (
          <button
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={onMobileClose}
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onMobileClose}
              className={`
                flex items-center px-3 py-2 rounded-md text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? "text-blue-700" : "text-gray-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </div>

      {/* 移动端侧边栏 */}
      {mobileOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={onMobileClose}
          />
          {/* 侧边栏面板 */}
          <div className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}

// 导出菜单图标供 Header 使用
export { MenuIcon };
