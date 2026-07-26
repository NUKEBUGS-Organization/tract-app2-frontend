import { useEffect } from 'react'
import axios from 'axios'
import api, { bootRefreshAccessToken } from '@/lib/api'
import { useNotificationSocket } from '@/hooks/useNotificationSocket'
import { useAuthStore } from '@/store/authStore'
import type { User, ApiResponse } from '@/types'

/**
 * Shared in-flight boot — StrictMode remount reuses this promise instead of
 * skipping work or aborting the first invocation.
 */
let bootPromise: Promise<void> | null = null

export default function AuthBootstrap() {
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = useAuthStore((s) => s.setToken)
  const setAuthReady = useAuthStore((s) => s.setAuthReady)
  const clearLocalSession = useAuthStore((s) => s.clearLocalSession)

  useNotificationSocket()

  useEffect(() => {
    if (useAuthStore.getState().authReady) return
    if (bootPromise) return

    bootPromise = (async () => {
      try {
        // Always cookie-refresh first (App 1 pattern). Persisted JWTs are not trusted at boot.
        const token = await bootRefreshAccessToken()

        if (!token) {
          clearLocalSession()
          return
        }

        setToken(token)

        const res = await api.get<ApiResponse<User>>('/auth/me')
        const user = res.data?.data
        if (user?.id) {
          setUser(user)
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          // Local only — do not revoke sibling app session via POST /auth/logout.
          clearLocalSession()
          return
        }
      } finally {
        // Every path must unblock ProtectedRoute — never leave authReady stuck false.
        if (!useAuthStore.getState().authReady) {
          setAuthReady(true)
        }
        bootPromise = null
      }
    })()
  }, [setUser, setToken, setAuthReady, clearLocalSession])

  return null
}
