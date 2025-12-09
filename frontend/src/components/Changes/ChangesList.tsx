import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { changesApi, Change } from '@/services/changes'
import { ChangeDetailModal } from './ChangeDetailModal'

interface ChangesListProps {
  monitorId: string
}

const changeTypeLabels = {
  initial: { text: '初始', color: 'bg-gray-100 text-gray-800' },
  no_change: { text: '无变化', color: 'bg-gray-100 text-gray-600' },
  changed: { text: '有变更', color: 'bg-blue-100 text-blue-800' },
}

export function ChangesList({ monitorId }: ChangesListProps) {
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null)
  const [showAllRecords, setShowAllRecords] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['changes', monitorId],
    queryFn: () => changesApi.list(monitorId, 0, 50),
  })

  // 过滤后的记录：默认只显示有变更的和初始记录
  const { filteredItems, hiddenCount } = useMemo(() => {
    if (!data?.items) return { filteredItems: [], hiddenCount: 0 }

    if (showAllRecords) {
      return { filteredItems: data.items, hiddenCount: 0 }
    }

    const filtered = data.items.filter(
      (item) => item.change_type !== 'no_change'
    )
    const hidden = data.items.length - filtered.length
    return { filteredItems: filtered, hiddenCount: hidden }
  }, [data?.items, showAllRecords])

  if (isLoading) {
    return <div className="text-gray-500 text-center py-8">加载中...</div>
  }

  if (!data?.items || data.items.length === 0) {
    return <div className="text-gray-500 text-center py-8">暂无变更记录</div>
  }

  return (
    <>
      {/* 显示/隐藏无变化记录的切换按钮 */}
      {hiddenCount > 0 && (
        <div className="pb-2 mb-2 border-b border-gray-100">
          <button
            onClick={() => setShowAllRecords(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            显示 {hiddenCount} 条无变化记录
          </button>
        </div>
      )}
      {showAllRecords && data.items.some((i) => i.change_type === 'no_change') && (
        <div className="pb-2 mb-2 border-b border-gray-100">
          <button
            onClick={() => setShowAllRecords(false)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            隐藏无变化记录
          </button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          暂无变更记录
          {hiddenCount > 0 && (
            <span className="block text-sm mt-1">
              （已隐藏 {hiddenCount} 条无变化记录）
            </span>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredItems.map((change) => (
            <ChangeItem
              key={change.id}
              change={change}
              onClick={() => setSelectedChangeId(change.id)}
            />
          ))}
        </div>
      )}

      {selectedChangeId && (
        <ChangeDetailModal
          isOpen={!!selectedChangeId}
          onClose={() => setSelectedChangeId(null)}
          monitorId={monitorId}
          changeId={selectedChangeId}
        />
      )}
    </>
  )
}

interface ChangeItemProps {
  change: Change
  onClick: () => void
}

function ChangeItem({ change, onClick }: ChangeItemProps) {
  const typeInfo = changeTypeLabels[change.change_type] || changeTypeLabels.no_change
  const hasChanges = change.change_type === 'changed'

  return (
    <div
      className={`py-3 flex justify-between items-center ${
        hasChanges ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={hasChanges ? onClick : undefined}
    >
      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
          {typeInfo.text}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(change.created_at).toLocaleString()}
        </span>
      </div>

      {hasChanges && (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            {change.added_count > 0 && (
              <span className="text-green-600 mr-2">+{change.added_count}</span>
            )}
            {change.removed_count > 0 && (
              <span className="text-red-600 mr-2">-{change.removed_count}</span>
            )}
            {change.modified_count > 0 && (
              <span className="text-yellow-600">~{change.modified_count}</span>
            )}
          </div>
          <span className="text-gray-400 text-sm">点击查看详情</span>
        </div>
      )}
    </div>
  )
}
