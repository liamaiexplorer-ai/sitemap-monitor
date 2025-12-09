import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button, Card, Modal, Input } from '@/components/UI'
import { Monitor, monitorsApi, UpdateMonitorRequest } from '@/services/monitors'

interface MonitorCardProps {
  monitor: Monitor
}

const statusLabels = {
  active: { text: '监控中', color: 'bg-green-100 text-green-800' },
  paused: { text: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
  error: { text: '错误', color: 'bg-red-100 text-red-800' },
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  const queryClient = useQueryClient()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: monitor.name,
    sitemap_url: monitor.sitemap_url,
    check_interval_minutes: monitor.check_interval_minutes,
  })

  const pauseMutation = useMutation({
    mutationFn: () => monitorsApi.pause(monitor.id),
    onSuccess: (updatedMonitor) => {
      queryClient.setQueryData(['monitors'], (old: { items: Monitor[]; total: number } | undefined) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.map((m) => (m.id === updatedMonitor.id ? updatedMonitor : m)),
        }
      })
    },
  })

  const resumeMutation = useMutation({
    mutationFn: () => monitorsApi.resume(monitor.id),
    onSuccess: (updatedMonitor) => {
      queryClient.setQueryData(['monitors'], (old: { items: Monitor[]; total: number } | undefined) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.map((m) => (m.id === updatedMonitor.id ? updatedMonitor : m)),
        }
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => monitorsApi.delete(monitor.id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['monitor', monitor.id] })
      queryClient.setQueryData(['monitors'], (old: { items: Monitor[]; total: number } | undefined) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.filter((m) => m.id !== monitor.id),
          total: old.total - 1,
        }
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMonitorRequest) => monitorsApi.update(monitor.id, data),
    onSuccess: (updatedMonitor) => {
      queryClient.setQueryData(['monitors'], (old: { items: Monitor[]; total: number } | undefined) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.map((m) => (m.id === updatedMonitor.id ? updatedMonitor : m)),
        }
      })
      setIsEditModalOpen(false)
    },
  })

  const handleDelete = () => {
    if (window.confirm('确定要删除此监控任务吗？')) {
      deleteMutation.mutate()
    }
  }

  const handleOpenEdit = () => {
    setEditForm({
      name: monitor.name,
      sitemap_url: monitor.sitemap_url,
      check_interval_minutes: monitor.check_interval_minutes,
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (editForm.check_interval_minutes < 1 || editForm.check_interval_minutes > 1440) {
      alert('检查间隔必须在 1 到 1440 分钟之间')
      return
    }
    updateMutation.mutate(editForm)
  }

  const statusInfo = statusLabels[monitor.status]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <Link
            to={`/monitors/${monitor.id}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
          >
            {monitor.name}
          </Link>
          <p className="text-sm text-gray-500 truncate mt-1">{monitor.sitemap_url}</p>
        </div>
        <span
          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
        >
          {statusInfo.text}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">检查间隔</span>
          <p className="text-gray-900">{monitor.check_interval_minutes} 分钟</p>
        </div>
        <div>
          <span className="text-gray-500">最后检查</span>
          <p className="text-gray-900">
            {monitor.last_check_at
              ? new Date(monitor.last_check_at).toLocaleString()
              : '从未检查'}
          </p>
        </div>
      </div>

      {monitor.last_error && (
        <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-600">
          {monitor.last_error}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {monitor.status === 'active' ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => pauseMutation.mutate()}
            loading={pauseMutation.isPending}
          >
            暂停
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => resumeMutation.mutate()}
            loading={resumeMutation.isPending}
          >
            恢复
          </Button>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={handleOpenEdit}
        >
          编辑
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={handleDelete}
          loading={deleteMutation.isPending}
        >
          删除
        </Button>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑监控任务"
      >
        <div className="space-y-4">
          <Input
            label="名称"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <Input
            label="Sitemap URL"
            value={editForm.sitemap_url}
            onChange={(e) => setEditForm({ ...editForm, sitemap_url: e.target.value })}
          />
          <Input
            label="检查间隔（分钟，1-1440）"
            type="number"
            min={1}
            max={1440}
            value={editForm.check_interval_minutes}
            onChange={(e) =>
              setEditForm({ ...editForm, check_interval_minutes: Number(e.target.value) })
            }
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit} loading={updateMutation.isPending}>
              保存
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  )
}
