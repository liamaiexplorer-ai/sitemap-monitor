import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setAccessToken } from '@/services/api'

interface User {
  id: string
  email: string
  is_active: boolean
  is_verified: boolean
  has_completed_onboarding: boolean
  created_at: string
  last_login_at: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  fetchUser: () => Promise<void>
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      setToken: (token) => {
        set({ token, isAuthenticated: !!token })
        setAccessToken(token)
      },

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', { email, password })
          const { access_token } = response.data
          get().setToken(access_token)
          await get().fetchUser()
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (email, password) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/register', { email, password })
          const { access_token } = response.data
          get().setToken(access_token)
          await get().fetchUser()
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          // 忽略登出错误
        }
        get().setToken(null)
        set({ user: null, isAuthenticated: false })
      },

      refresh: async () => {
        try {
          const response = await api.post('/auth/refresh')
          const { access_token } = response.data
          get().setToken(access_token)
        } catch {
          get().setToken(null)
          set({ user: null, isAuthenticated: false })
        }
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/users/me')
          set({ user: response.data, isAuthenticated: true })
        } catch {
          get().setToken(null)
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          setAccessToken(state.token)
          state.fetchUser()
        }
      },
    }
  )
)
