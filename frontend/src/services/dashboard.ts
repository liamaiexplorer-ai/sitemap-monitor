import { api } from './api'

export interface RecentChange {
  id: string
  monitor_task_id: string
  monitor_name: string
  added_count: number
  removed_count: number
  modified_count: number
  created_at: string
}

export interface DashboardStats {
  active_monitors: number
  error_monitors: number
  today_changes: number
  notification_channels: number
  recent_changes: RecentChange[]
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats')
    return response.data
  },
}
