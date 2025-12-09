import { useState, ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="p-4 sm:p-6">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
