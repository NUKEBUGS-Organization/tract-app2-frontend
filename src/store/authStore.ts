import axios from 'axios'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { disconnectSocket } from '@/lib/socket'
import type { User } from '@/types'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface AuthState {
  user: User | null
  /** In-memory only — never restored from localStorage (cookie refresh is boot source of truth). */
  accessToken: string | null
  isAuthenticated: boolean
  /** False until silent cookie refresh /auth/me boot finishes. */
  authReady: boolean
  isLoading: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  setSession: (token: string, user: User) => void
  setAuthReady: (ready: boolean) => void
  /** Local clear only — does NOT call POST /auth/logout. */
  clearLocalSession: () => void
  /** Explicit user logout — revokes server session. */
  logout: () => void
  setLoading: (v: boolean) => void
}

function clearLegacyTokenStorage() {
  localStorage.removeItem('tract_access_token')
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      authReady: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => {
        clearLegacyTokenStorage()
        set({ accessToken: token, isAuthenticated: true })
      },
      setSession: (token, user) => {
        clearLegacyTokenStorage()
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
          authReady: true,
        })
      },
      setAuthReady: (authReady) => set({ authReady }),
      clearLocalSession: () => {
        disconnectSocket()
        clearLegacyTokenStorage()
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          authReady: true,
        })
      },
      logout: () => {
        disconnectSocket()
        void axios.post(`${apiBase}/auth/logout`, {}, { withCredentials: true })
        clearLegacyTokenStorage()
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          authReady: true,
        })
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'tract-auth',
      // Do not persist accessToken / isAuthenticated — stale JWTs break cookie SSO on reload.
      partialize: (s) => ({
        user: s.user,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AuthState>
        return {
          ...current,
          ...p,
          // Never restore tokens or auth flags from disk — boot refresh owns session.
          accessToken: null,
          isAuthenticated: false,
          authReady: false,
        }
      },
    },
  ),
)
