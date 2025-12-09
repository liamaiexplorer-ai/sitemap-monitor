import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Modal } from '@/components/UI'
import { monitorsApi } from '@/services/monitors'
import { handleApiError } from '@/services/api'

interface AddMonitorFormProps {
  isOpen: boolean
  onClose: () => void
}

const INTERVAL_OPTIONS = [
  { value: 1, label: '每 1 分钟' },
  { value: 5, label: '每 5 分钟' },
  { value: 15, label: '每 15 分钟' },
  { value: 30, label: '每 30 分钟' },
  { value: 60, label: '每小时' },
  { value: 360, label: '每 6 小时' },
  { value: 720, label: '每 12 小时' },
  { value: 1440, label: '每天' },
]

export function AddMonitorForm({ isOpen, onClose }: AddMonitorFormProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [interval, setInterval] = useState(60)
  const [error, setError] = useState('')
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    urlCount: number
    isIndex: boolean
  } | null>(null)

  const validateMutation = useMutation({
    mutationFn: (url: string) => monitorsApi.validateUrl(url),
    onSuccess: (result) => {
      if (result.valid) {
        setValidationResult({
          valid: true,
          urlCount: result.url_count,
          isIndex: result.is_index,
        })
        setError('')
      } else {
        setValidationResult(null)
        setError(result.error || '无效的 Sitemap URL')
      }
    },
    onError: (err) => {
      setValidationResult(null)
      setError(handleApiError(err))
    },
  })

  const createMutation = useMutation({
    mutationFn: () =>
      monitorsApi.create({
        name,
        sitemap_url: url,
        check_interval_minutes: interval,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitors'] })
      handleClose()
    },
    onError: (err) => {
      setError(handleApiError(err))
    },
  })

  const handleClose = () => {
    setName('')
    setUrl('')
    setInterval(60)
    setError('')
    setValidationResult(null)
    onClose()
  }

  const handleValidate = () => {
    if (!url.trim()) {
      setError('请输入 Sitemap URL')
      return
    }
    validateMutation.mutate(url)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('请输入任务名称')
      return
    }
    if (!validationResult?.valid) {
      setError('请先验证 Sitemap URL')
      return
    }
    createMutation.mutate()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="添加监控任务" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <Input
          label="任务名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：我的博客 Sitemap"
          required
        />

        <div className="space-y-2">
          <Input
            label="Sitemap URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setValidationResult(null)
            }}
            placeholder="https://example.com/sitemap.xml"
            required
          />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleValidate}
              loading={validateMutation.isPending}
            >
              验证 URL
            </Button>
            {validationResult?.valid && (
              <span className="text-sm text-green-600">
                ✓ 有效（{validationResult.isIndex ? 'Sitemap Index' : `${validationResult.urlCount} 个 URL`}）
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            检查间隔
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            {INTERVAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            取消
          </Button>
          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={!validationResult?.valid}
          >
            创建监控
          </Button>
        </div>
      </form>
    </Modal>
  )
}
