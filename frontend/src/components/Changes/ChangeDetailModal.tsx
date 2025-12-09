import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '@/components/UI'
import { changesApi, ChangeDetail } from '@/services/changes'

interface ChangeDetailModalProps {
  isOpen: boolean
  onClose: () => void
  monitorId: string
  changeId: string
}

type TabType = 'added' | 'removed' | 'modified'

export function ChangeDetailModal({
  isOpen,
  onClose,
  monitorId,
  changeId,
}: ChangeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('added')

  const { data: detail, isLoading } = useQuery({
    queryKey: ['change-detail', monitorId, changeId],
    queryFn: () => changesApi.getDetail(monitorId, changeId),
    enabled: isOpen && !!changeId,
  })

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'added', label: '新增', count: detail?.added_count ?? 0 },
    { key: 'removed', label: '删除', count: detail?.removed_count ?? 0 },
    { key: 'modified', label: '修改', count: detail?.modified_count ?? 0 },
  ]

  const renderUrlList = () => {
    if (!detail?.changes) return null

    if (activeTab === 'added') {
      const items = detail.changes.added || []
      if (items.length === 0) {
        return <div className="text-gray-500 text-center py-4">无新增 URL</div>
      }
      return (
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="py-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all text-sm"
              >
                {item.url}
              </a>
              {item.lastmod && (
                <div className="text-xs text-gray-500 mt-1">
                  lastmod: {item.lastmod}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'removed') {
      const items = detail.changes.removed || []
      if (items.length === 0) {
        return <div className="text-gray-500 text-center py-4">无删除 URL</div>
      }
      return (
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="py-2">
              <span className="text-gray-600 break-all text-sm line-through">
                {item.url}
              </span>
              {item.lastmod && (
                <div className="text-xs text-gray-500 mt-1">
                  lastmod: {item.lastmod}
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'modified') {
      const items = detail.changes.modified || []
      if (items.length === 0) {
        return <div className="text-gray-500 text-center py-4">无修改 URL</div>
      }
      return (
        <div className="divide-y divide-gray-100">
          {items.map((item, index) => (
            <div key={index} className="py-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all text-sm"
              >
                {item.url}
              </a>
              <div className="text-xs mt-1 space-x-2">
                <span className="text-red-500">
                  旧: {item.old_lastmod || '(无)'}
                </span>
                <span className="text-gray-400">→</span>
                <span className="text-green-500">
                  新: {item.new_lastmod || '(无)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="变更详情" size="lg">
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : detail ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            检测时间: {new Date(detail.created_at).toLocaleString()}
          </div>

          {/* Tab 切换 */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* URL 列表 */}
          <div className="max-h-96 overflow-y-auto">{renderUrlList()}</div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">无法加载变更详情</div>
      )}
    </Modal>
  )
}
