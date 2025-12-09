import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, CardHeader } from '@/components/UI'
import { ChangesList } from '@/components/Changes'
import { monitorsApi } from '@/services/monitors'

const statusLabels = {
  active: { text: '监控中', color: 'bg-green-100 text-green-800' },
  paused: { text: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
  error: { text: '错误', color: 'bg-red-100 text-red-800' },
}

export function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: monitor, isLoading, error } = useQuery({
    queryKey: ['monitor', id],
    queryFn: () => monitorsApi.get(id!),
    enabled: !!id,
  })

  const pauseMutation = useMutation({
    mutationFn: () => monitorsApi.pause(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor', id] })
    },
  })

  const resumeMutation = useMutation({
    mutationFn: () => monitorsApi.resume(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitor', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => monitorsApi.delete(id!),
    onSuccess: () => {
      navigate('/monitors')
    },
  })

  const handleDelete = () => {
    if (window.confirm('确定要删除此监控任务吗？')) {
      deleteMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">监控详情</h1>
        <Card>
          <div className="text-gray-500 text-center py-8">加载中...</div>
        </Card>
      </div>
    )
  }

  if (error || !monitor) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">监控详情</h1>
        <Card>
          <div className="text-red-600 text-center py-8">监控任务不存在</div>
        </Card>
      </div>
    )
  }

  const statusInfo = statusLabels[monitor.status]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/monitors')}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{monitor.name}</h1>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
        </div>
        <div className="flex gap-2">
          {monitor.status === 'active' ? (
            <Button
              variant="secondary"
              onClick={() => pauseMutation.mutate()}
              loading={pauseMutation.isPending}
            >
              暂停
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => resumeMutation.mutate()}
              loading={resumeMutation.isPending}
            >
              恢复
            </Button>
          )}
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
          >
            删除
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="基本信息" />
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">Sitemap URL</dt>
              <dd className="mt-1 text-gray-900 break-all">{monitor.sitemap_url}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">检查间隔</dt>
              <dd className="mt-1 text-gray-900">{monitor.check_interval_minutes} 分钟</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">创建时间</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(monitor.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="检查状态" />
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-gray-500">最后检查时间</dt>
              <dd className="mt-1 text-gray-900">
                {monitor.last_check_at
                  ? new Date(monitor.last_check_at).toLocaleString()
                  : '从未检查'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">连续错误次数</dt>
              <dd className="mt-1 text-gray-900">{monitor.error_count}</dd>
            </div>
            {monitor.last_error && (
              <div>
                <dt className="text-sm text-gray-500">最后错误</dt>
                <dd className="mt-1 text-red-600">{monitor.last_error}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader title="变更历史" description="最近检测到的 Sitemap 变更，点击有变更的记录查看详情" />
        <ChangesList monitorId={id!} />
      </Card>
    </div>
  )
}
