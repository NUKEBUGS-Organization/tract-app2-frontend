import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

/** No interceptors — used for refresh to avoid recursion */
const refreshAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
})

function getAccessToken(): string | null {
  const legacy = localStorage.getItem('tract_access_token')
  if (legacy) return legacy
  try {
    const raw = localStorage.getItem('tract-auth')
    if (!raw) return null
    const p = JSON.parse(raw) as { state?: { accessToken?: string | null } }
    return p.state?.accessToken ?? null
  } catch {
    return null
  }
}

function clearAuthStorage() {
  localStorage.removeItem('tract_access_token')
  localStorage.removeItem('tract-auth')
}

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/change-password', '/auth/forgot-password', '/auth/reset-password']

function isPublicAuthRequest(url: string | undefined): boolean {
  if (!url) return false
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAxios
      .post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh')
      .then((res) => {
        const token = res.data?.data?.accessToken
        if (token) useAuthStore.getState().setToken(token)
        return token ?? null
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const requestUrl = originalRequest?.url ?? ''

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // ── 401 → try token refresh ───────────────────
    if (status === 401 && !originalRequest._retry && !requestUrl.includes('/auth/')) {
      originalRequest._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── 401 on protected routes after retry / refresh failure ──
    if (status === 401 && originalRequest._retry && !isPublicAuthRequest(requestUrl)) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── 401 on refresh endpoint ───────────────────
    if (status === 401 && requestUrl.includes('/auth/refresh')) {
      clearAuthStorage()
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── 403 → forbidden toast ─────────────────────
    if (status === 403) {
      const msg = (error.response?.data as { message?: string | string[] } | undefined)?.message
      toast.error(String(Array.isArray(msg) ? msg[0] : msg ?? 'You do not have permission to do that.'))
      return Promise.reject(error)
    }

    // ── 429 → rate limit toast ────────────────────
    if (status === 429) {
      toast.error('Too many requests. Please slow down.')
      return Promise.reject(error)
    }

    // ── 500+ / network → server error toast ───────
    if ((status !== undefined && status >= 500) || error.code === 'ERR_NETWORK') {
      toast.error('Server error. Please try again shortly.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api
