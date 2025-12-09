import { useAuthStore } from "@/stores/authStore";
import { MenuIcon } from "./Sidebar";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          onClick={onMenuClick}
        >
          <MenuIcon className="w-6 h-6" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user.email}
              </span>
              <span className="text-sm text-gray-700 sm:hidden">
                {user.email.split("@")[0]}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                退出
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
