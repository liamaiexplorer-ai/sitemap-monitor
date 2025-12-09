import { api } from './api'

export interface Change {
  id: string
  monitor_task_id: string
  change_type: 'initial' | 'no_change' | 'changed'
  added_count: number
  removed_count: number
  modified_count: number
  created_at: string
}

export interface UrlItem {
  url: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export interface ModifiedItem {
  url: string
  old_lastmod?: string
  new_lastmod?: string
}

export interface ChangeDetail extends Change {
  changes: {
    added: UrlItem[]
    removed: UrlItem[]
    modified: ModifiedItem[]
  }
}

export interface ChangeListResponse {
  items: Change[]
  total: number
}

export const changesApi = {
  list: async (monitorId: string, skip = 0, limit = 20): Promise<ChangeListResponse> => {
    const response = await api.get<ChangeListResponse>(
      `/monitors/${monitorId}/changes`,
      { params: { skip, limit } }
    )
    return response.data
  },

  getDetail: async (monitorId: string, changeId: string): Promise<ChangeDetail> => {
    const response = await api.get<ChangeDetail>(
      `/monitors/${monitorId}/changes/${changeId}`
    )
    return response.data
  },
}
