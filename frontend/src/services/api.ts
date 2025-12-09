import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// 创建 axios 实例
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// 存储访问令牌
let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // 如果是 401 错误且不是刷新令牌请求
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      try {
        // 尝试刷新令牌
        const response = await api.post('/auth/refresh')
        const { access_token } = response.data
        setAccessToken(access_token)

        // 重试原请求
        originalRequest.headers.Authorization = `Bearer ${access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        // 刷新失败，清除令牌
        setAccessToken(null)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API 错误类型
export interface ApiError {
  detail: string
}

// 通用 API 响应处理
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined
    return apiError?.detail || error.message
  }
  return '未知错误'
}
