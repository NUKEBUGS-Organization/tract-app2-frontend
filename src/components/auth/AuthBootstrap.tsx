import { useEffect } from 'react'
import axios from 'axios'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { User, ApiResponse } from '@/types'

export default function AuthBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setUser     = useAuthStore((s) => s.setUser)
  const logout      = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!accessToken) return

    const ac = new AbortController()

    ;(async () => {
      try {
        const res = await api.get<ApiResponse<User>>(
          '/auth/me',
          { signal: ac.signal },
        )
        const user = res.data?.data
        if (user?.id) {
          setUser(user)
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.code === 'ERR_CANCELED') return
          if (err.response?.status === 401) {
            logout()
          }
        }
      }
    })()

    return () => ac.abort()
  }, [accessToken, setUser, logout])

  return null
}
