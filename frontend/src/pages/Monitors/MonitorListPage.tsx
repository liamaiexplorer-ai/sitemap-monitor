import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card } from '@/components/UI'
import { MonitorCard } from '@/components/Monitors'
import { AddMonitorForm } from '@/components/Forms'
import { monitorsApi } from '@/services/monitors'

export function MonitorListPage() {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['monitors'],
    queryFn: () => monitorsApi.list(),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">监控任务</h1>
        <Button onClick={() => setIsAddFormOpen(true)}>添加监控</Button>
      </div>

      {isLoading && (
        <Card>
          <div className="text-gray-500 text-center py-8">加载中...</div>
        </Card>
      )}

      {error && (
        <Card>
          <div className="text-red-600 text-center py-8">加载失败，请刷新重试</div>
        </Card>
      )}

      {data && data.items.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              暂无监控任务
            </h3>
            <p className="mt-2 text-gray-500">
              点击"添加监控"按钮创建您的第一个 Sitemap 监控任务
            </p>
            <Button className="mt-4" onClick={() => setIsAddFormOpen(true)}>
              添加监控
            </Button>
          </div>
        </Card>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      )}

      <AddMonitorForm isOpen={isAddFormOpen} onClose={() => setIsAddFormOpen(false)} />
    </div>
  )
}
