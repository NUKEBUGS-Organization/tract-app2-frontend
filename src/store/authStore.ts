import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { disconnectSocket } from '@/lib/socket'
import type { User } from '@/types'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  setSession: (token: string, user: User) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => {
        localStorage.setItem('tract_access_token', token)
        set({ accessToken: token })
      },
      setSession: (token, user) => {
        localStorage.setItem('tract_access_token', token)
        set({ accessToken: token, user, isAuthenticated: true })
      },
      logout: () => {
        disconnectSocket()
        void axios.post(`${apiBase}/auth/logout`, {}, { withCredentials: true })
        localStorage.removeItem('tract_access_token')
        localStorage.removeItem('tract-auth')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'tract-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
)
