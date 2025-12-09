import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AppLayout, AuthLayout } from '@/components/Layout'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@/pages/Auth'
import { DashboardPage } from '@/pages/Dashboard/DashboardPage'
import SettingsPage from '@/pages/Dashboard/Settings'
import SitemapsPage from '@/pages/Dashboard/Sitemaps'
import { MonitorListPage } from '@/pages/Monitors/MonitorListPage'
import { MonitorDetailPage } from '@/pages/Monitors/MonitorDetailPage'
import LandingPage from '@/pages/marketing/Landing'

// 路由保护组件
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route
        element={
          <PublicRoute>
            <Outlet />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* 私有路由 */}
      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/monitors" element={<MonitorListPage />} />
        <Route path="/monitors/:id" element={<MonitorDetailPage />} />
        <Route path="/sitemaps" element={<SitemapsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 默认重定向 */}
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
