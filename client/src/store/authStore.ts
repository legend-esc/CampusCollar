import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: { id: string; email: string; name?: string; role: string } | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (data: { email: string; password: string; name: string; university: string }) => Promise<{ userId: string }>
  verifyEmail: (email: string, otp: string) => Promise<void>
  refreshTokenAction: () => Promise<void>
  logout: () => void
  setUser: (user: AuthState['user']) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Login failed')
          }
          const data = await res.json()
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          const meRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          })
          if (meRes.ok) {
            const user = await meRes.json()
            set({ user })
          }
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Signup failed')
          }
          const result = await res.json()
          set({ isLoading: false })
          return result
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      verifyEmail: async (email, otp) => {
        set({ isLoading: true, error: null })
        try {
          const res = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
          })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.error || 'Verification failed')
          }
          set({ isLoading: false })
        } catch (err: any) {
          set({ error: err.message, isLoading: false })
          throw err
        }
      },

      refreshTokenAction: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return
        try {
          const res = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })
          if (!res.ok) throw new Error('Token refresh failed')
          const data = await res.json()
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        } catch {
          set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false })
        }
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, error: null })
      },

      setUser: (user) => set({ user }),

      clearError: () => set({ error: null }),
    }),
    { name: 'campuscollar-auth' }
  )
)
