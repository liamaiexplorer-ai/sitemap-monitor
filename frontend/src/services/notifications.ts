import { api } from './api'

export interface NotificationChannel {
  id: string
  name: string
  channel_type: 'email' | 'webhook'
  config: Record<string, unknown>
  is_active: boolean
  last_test_at: string | null
  last_test_success: boolean | null
  created_at: string
}

export interface ChannelListResponse {
  items: NotificationChannel[]
  total: number
}

export interface CreateChannelRequest {
  name: string
  channel_type: 'email' | 'webhook'
  config: Record<string, unknown>
}

export interface UpdateChannelRequest {
  name?: string
  config?: Record<string, unknown>
  is_active?: boolean
}

export interface TestResultResponse {
  success: boolean
  error?: string
}

export const notificationsApi = {
  list: async (skip = 0, limit = 20): Promise<ChannelListResponse> => {
    const response = await api.get<ChannelListResponse>('/notification-channels', {
      params: { skip, limit },
    })
    return response.data
  },

  get: async (channelId: string): Promise<NotificationChannel> => {
    const response = await api.get<NotificationChannel>(`/notification-channels/${channelId}`)
    return response.data
  },

  create: async (data: CreateChannelRequest): Promise<NotificationChannel> => {
    const response = await api.post<NotificationChannel>('/notification-channels', data)
    return response.data
  },

  update: async (channelId: string, data: UpdateChannelRequest): Promise<NotificationChannel> => {
    const response = await api.patch<NotificationChannel>(`/notification-channels/${channelId}`, data)
    return response.data
  },

  delete: async (channelId: string): Promise<void> => {
    await api.delete(`/notification-channels/${channelId}`)
  },

  test: async (channelId: string): Promise<TestResultResponse> => {
    const response = await api.post<TestResultResponse>(`/notification-channels/${channelId}/test`)
    return response.data
  },
}
