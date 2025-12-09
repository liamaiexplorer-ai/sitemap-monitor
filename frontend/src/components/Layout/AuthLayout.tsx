import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

interface AuthLayoutProps {
  children?: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Sitemap Monitor</h1>
          <p className="mt-2 text-gray-600">监控您的网站 Sitemap 变更</p>
        </div>
        {children || <Outlet />}
      </div>
    </div>
  )
}
