import { api } from './api'

export interface Monitor {
  id: string
  name: string
  sitemap_url: string
  check_interval_minutes: number
  status: 'active' | 'paused' | 'error'
  last_check_at: string | null
  last_error: string | null
  error_count: number
  created_at: string
  updated_at: string
}

export interface MonitorListResponse {
  items: Monitor[]
  total: number
}

export interface CreateMonitorRequest {
  name: string
  sitemap_url: string
  check_interval_minutes?: number
}

export interface UpdateMonitorRequest {
  name?: string
  sitemap_url?: string
  check_interval_minutes?: number
}

export interface ValidateUrlResponse {
  valid: boolean
  is_index: boolean
  url_count: number
  child_sitemaps: number
  error: string | null
}

export const monitorsApi = {
  // 验证 URL
  validateUrl: async (url: string): Promise<ValidateUrlResponse> => {
    const response = await api.post('/monitors/validate-url', { url })
    return response.data
  },

  // 创建监控
  create: async (data: CreateMonitorRequest): Promise<Monitor> => {
    const response = await api.post('/monitors', data)
    return response.data
  },

  // 获取列表
  list: async (params?: {
    status?: string
    skip?: number
    limit?: number
  }): Promise<MonitorListResponse> => {
    const response = await api.get('/monitors', { params })
    return response.data
  },

  // 获取详情
  get: async (id: string): Promise<Monitor> => {
    const response = await api.get(`/monitors/${id}`)
    return response.data
  },

  // 更新
  update: async (id: string, data: UpdateMonitorRequest): Promise<Monitor> => {
    const response = await api.patch(`/monitors/${id}`, data)
    return response.data
  },

  // 删除
  delete: async (id: string): Promise<void> => {
    await api.delete(`/monitors/${id}`)
  },

  // 暂停
  pause: async (id: string): Promise<Monitor> => {
    const response = await api.post(`/monitors/${id}/pause`)
    return response.data
  },

  // 恢复
  resume: async (id: string): Promise<Monitor> => {
    const response = await api.post(`/monitors/${id}/resume`)
    return response.data
  },

  // 手动检查
  check: async (id: string): Promise<void> => {
    await api.post(`/monitors/${id}/check`)
  },
}
