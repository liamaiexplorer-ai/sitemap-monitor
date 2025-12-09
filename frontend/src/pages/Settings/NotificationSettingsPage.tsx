import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, CardHeader, Modal, Input } from '@/components/UI'
import { notificationsApi, NotificationChannel, CreateChannelRequest } from '@/services/notifications'
import { handleApiError } from '@/services/api'

export function NotificationSettingsPage() {
  const queryClient = useQueryClient()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['notification-channels'],
    queryFn: () => notificationsApi.list(0, 100),
  })

  const deleteMutation = useMutation({
    mutationFn: (channelId: string) => notificationsApi.delete(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })

  const testMutation = useMutation({
    mutationFn: (channelId: string) => notificationsApi.test(channelId),
    onSuccess: (result, channelId) => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
      if (result.success) {
        alert('测试通知发送成功!')
      } else {
        alert(`测试失败: ${result.error || '未知错误'}`)
      }
    },
    onError: (err) => {
      alert(`测试失败: ${handleApiError(err)}`)
    },
  })

  const handleDelete = (channel: NotificationChannel) => {
    if (window.confirm(`确定要删除通知渠道 "${channel.name}" 吗？`)) {
      deleteMutation.mutate(channel.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">通知设置</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>添加通知渠道</Button>
      </div>

      <Card>
        <CardHeader
          title="通知渠道"
          description="管理你的通知渠道，监控到变更时会通过这些渠道发送通知"
        />
        {isLoading ? (
          <div className="text-gray-500 text-center py-8">加载中...</div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            暂无通知渠道，点击上方按钮添加
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.items.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                onEdit={() => setEditingChannel(channel)}
                onDelete={() => handleDelete(channel)}
                onTest={() => testMutation.mutate(channel.id)}
                isTesting={testMutation.isPending}
              />
            ))}
          </div>
        )}
      </Card>

      {/* 添加渠道弹窗 */}
      <AddChannelModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* 编辑渠道弹窗 */}
      {editingChannel && (
        <EditChannelModal
          isOpen={!!editingChannel}
          onClose={() => setEditingChannel(null)}
          channel={editingChannel}
        />
      )}
    </div>
  )
}

interface ChannelItemProps {
  channel: NotificationChannel
  onEdit: () => void
  onDelete: () => void
  onTest: () => void
  isTesting: boolean
}

function ChannelItem({ channel, onEdit, onDelete, onTest, isTesting }: ChannelItemProps) {
  const typeLabels = {
    email: '邮件',
    webhook: 'Webhook',
  }

  return (
    <div className="py-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{channel.name}</span>
          <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">
            {typeLabels[channel.channel_type]}
          </span>
          {!channel.is_active && (
            <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">
              已禁用
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {channel.channel_type === 'webhook' && (channel.config as { url?: string }).url}
          {channel.channel_type === 'email' && (channel.config as { email?: string }).email}
        </div>
        {channel.last_test_at && (
          <div className="text-xs text-gray-400 mt-1">
            最后测试: {new Date(channel.last_test_at).toLocaleString()}
            {channel.last_test_success !== null && (
              <span className={channel.last_test_success ? 'text-green-600' : 'text-red-600'}>
                {' '}({channel.last_test_success ? '成功' : '失败'})
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onTest} loading={isTesting}>
          测试
        </Button>
        <Button size="sm" variant="secondary" onClick={onEdit}>
          编辑
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          删除
        </Button>
      </div>
    </div>
  )
}

interface AddChannelModalProps {
  isOpen: boolean
  onClose: () => void
}

function AddChannelModal({ isOpen, onClose }: AddChannelModalProps) {
  const queryClient = useQueryClient()
  const [channelType, setChannelType] = useState<'webhook' | 'email'>('webhook')
  const [name, setName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: (data: CreateChannelRequest) => notificationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      handleClose()
    },
    onError: (err) => {
      setError(handleApiError(err))
    },
  })

  const handleClose = () => {
    setName('')
    setWebhookUrl('')
    setEmail('')
    setError('')
    setChannelType('webhook')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('请输入渠道名称')
      return
    }

    let config: Record<string, unknown> = {}
    if (channelType === 'webhook') {
      if (!webhookUrl.trim()) {
        setError('请输入 Webhook URL')
        return
      }
      config = { url: webhookUrl, method: 'POST' }
    } else {
      if (!email.trim()) {
        setError('请输入邮箱地址')
        return
      }
      config = { email }
    }

    createMutation.mutate({
      name,
      channel_type: channelType,
      config,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="添加通知渠道">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
        )}

        <Input
          label="渠道名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：我的 Webhook"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">渠道类型</label>
          <select
            value={channelType}
            onChange={(e) => setChannelType(e.target.value as 'webhook' | 'email')}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="webhook">Webhook</option>
            <option value="email">邮件</option>
          </select>
        </div>

        {channelType === 'webhook' ? (
          <Input
            label="Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://example.com/webhook"
            required
          />
        ) : (
          <Input
            label="邮箱地址"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button type="submit" loading={createMutation.isPending}>
            创建
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface EditChannelModalProps {
  isOpen: boolean
  onClose: () => void
  channel: NotificationChannel
}

function EditChannelModal({ isOpen, onClose, channel }: EditChannelModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(channel.name)
  const [webhookUrl, setWebhookUrl] = useState(
    channel.channel_type === 'webhook' ? (channel.config as { url?: string }).url || '' : ''
  )
  const [email, setEmail] = useState(
    channel.channel_type === 'email' ? (channel.config as { email?: string }).email || '' : ''
  )
  const [isActive, setIsActive] = useState(channel.is_active)
  const [error, setError] = useState('')

  const updateMutation = useMutation({
    mutationFn: () => {
      let config: Record<string, unknown> | undefined
      if (channel.channel_type === 'webhook') {
        config = { url: webhookUrl, method: 'POST' }
      } else {
        config = { email }
      }
      return notificationsApi.update(channel.id, { name, config, is_active: isActive })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels'] })
      onClose()
    },
    onError: (err) => {
      setError(handleApiError(err))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('请输入渠道名称')
      return
    }

    if (channel.channel_type === 'webhook' && !webhookUrl.trim()) {
      setError('请输入 Webhook URL')
      return
    }

    if (channel.channel_type === 'email' && !email.trim()) {
      setError('请输入邮箱地址')
      return
    }

    updateMutation.mutate()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="编辑通知渠道">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
        )}

        <Input
          label="渠道名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {channel.channel_type === 'webhook' ? (
          <Input
            label="Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            required
          />
        ) : (
          <Input
            label="邮箱地址"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            启用此通知渠道
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" loading={updateMutation.isPending}>
            保存
          </Button>
        </div>
      </form>
    </Modal>
  )
}
