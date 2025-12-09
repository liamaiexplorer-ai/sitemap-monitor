import { useAuthStore } from "@/stores/authStore";
import { Menu, Bell, User, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Menu as HeadlessMenu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { cn } from "@/utils/cn";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Language Switcher */}
          <HeadlessMenu as="div" className="relative ml-3">
            <div>
              <HeadlessMenu.Button className="flex items-center p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50">
                <Languages className="w-5 h-5" />
              </HeadlessMenu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <HeadlessMenu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => changeLanguage('zh')}
                      className={cn(
                        active ? 'bg-slate-50' : '',
                        'block px-4 py-2 text-sm text-slate-700 w-full text-left',
                        i18n.language === 'zh' ? 'font-bold text-indigo-600' : ''
                      )}
                    >
                      中文
                    </button>
                  )}
                </HeadlessMenu.Item>
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => changeLanguage('en')}
                      className={cn(
                        active ? 'bg-slate-50' : '',
                        'block px-4 py-2 text-sm text-slate-700 w-full text-left',
                        i18n.language === 'en' ? 'font-bold text-indigo-600' : ''
                      )}
                    >
                      English
                    </button>
                  )}
                </HeadlessMenu.Item>
              </HeadlessMenu.Items>
            </Transition>
          </HeadlessMenu>

          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-medium text-slate-700">
                  {user.email?.split("@")[0]}
                </span>
                <span className="text-xs text-slate-400">Admin</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <button
                onClick={logout}
                className="text-xs font-medium text-slate-500 hover:text-red-600 ml-2 transition-colors"
              >
                {t('common.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">{t('common.login')}</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
