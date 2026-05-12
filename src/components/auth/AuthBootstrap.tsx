import { useEffect } from 'react'
import axios from 'axios'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

type MeEnvelope = { success: boolean; data: User }

/**
 * Revalidates session on load when an access token exists (e.g. after hard refresh).
 */
export default function AuthBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    if (!accessToken) return
    const ac = new AbortController()
    ;(async () => {
      try {
        const { data } = await api.get<MeEnvelope>('/users/me', { signal: ac.signal })
        if (data?.data) setUser(data.data)
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return
        logout()
      }
    })()
    return () => ac.abort()
  }, [accessToken, setUser, logout])

  return null
}
