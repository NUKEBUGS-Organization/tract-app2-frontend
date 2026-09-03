import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

// Only needed when the API itself is reached through an ngrok free-tier tunnel.
// Sending it always breaks production CORS (backend must allowlist the header).
const isNgrokApi = /ngrok/i.test(baseURL)
const commonHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  ...(isNgrokApi ? { 'ngrok-skip-browser-warning': 'true' } : {}),
}

/** No interceptors — used for refresh to avoid recursion */
const refreshAxios = axios.create({
  baseURL,
  withCredentials: true,
  headers: { ...commonHeaders },
  timeout: 15000,
})

const api = axios.create({
  baseURL,
  headers: { ...commonHeaders },
  timeout: 15000,
  withCredentials: true,
})

/** In-memory access token only — never read stale JWTs from localStorage. */
function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken
}

function clearAuthStorage() {
  localStorage.removeItem('tract_access_token')
}

/** Endpoints where a 401 must not trigger refresh+retry (would loop or is pointless). */
const AUTH_NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-login-otp',
  '/auth/resend-login-otp',
  '/auth/send-otp',
  '/auth/verify-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/change-password',
]

function isAuthNoRefreshRequest(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_NO_REFRESH_PATHS.some((path) => url.includes(path))
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isTokenRotatedError(err: unknown): boolean {
  if (!axios.isAxiosError(err) || err.response?.status !== 401) return false
  const data = err.response?.data as { code?: string } | undefined
  return data?.code === 'TOKEN_ROTATED'
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  // Let the browser set multipart boundary for FormData uploads.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function postRefresh(): Promise<string | null> {
  const res = await refreshAxios.post<{
    success: boolean
    data: { accessToken: string }
  }>('/auth/refresh')
  const token = res.data?.data?.accessToken
  if (token) useAuthStore.getState().setToken(token)
  return token ?? null
}

/**
 * Single-flight refresh. Concurrent callers await the same request.
 * On TOKEN_ROTATED, retry once after 500ms (newer cookie from sibling rotation).
 */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        return await postRefresh()
      } catch (err) {
        if (isTokenRotatedError(err)) {
          await sleep(500)
          try {
            return await postRefresh()
          } catch {
            return null
          }
        }
        return null
      }
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

/**
 * Boot-time silent refresh. Always returns the shared in-flight refreshPromise
 * (never a premature null from a one-shot "already started" flag).
 */
export function bootRefreshAccessToken(): Promise<string | null> {
  return refreshAccessToken()
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }
    const requestUrl = originalRequest?.url ?? ''

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // ── 401 → try token refresh (includes /auth/me; excludes login/refresh/otp) ──
    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthNoRefreshRequest(requestUrl)
    ) {
      originalRequest._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }
      // Local clear only — do NOT POST /auth/logout (SSO-safe).
      useAuthStore.getState().clearLocalSession()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── 401 on protected routes after retry / refresh failure ──
    if (
      status === 401 &&
      originalRequest._retry &&
      !isAuthNoRefreshRequest(requestUrl)
    ) {
      useAuthStore.getState().clearLocalSession()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── 401 on refresh endpoint (hard failure; TOKEN_ROTATED handled in refreshAccessToken) ──
    if (status === 401 && requestUrl.includes('/auth/refresh')) {
      clearAuthStorage()
      useAuthStore.getState().clearLocalSession()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // ── 403 → forbidden toast ─────────────────────
    if (status === 403) {
      const msg = (
        error.response?.data as { message?: string | string[] } | undefined
      )?.message
      toast.error(
        String(
          Array.isArray(msg)
            ? msg[0]
            : (msg ?? 'You do not have permission to do that.'),
        ),
      )
      return Promise.reject(error)
    }

    // ── 429 → rate limit toast ────────────────────
    if (status === 429) {
      toast.error('Too many requests. Please slow down.')
      return Promise.reject(error)
    }

    // ── 500+ / network → server error toast ───────
    if (
      (status !== undefined && status >= 500) ||
      error.code === 'ERR_NETWORK'
    ) {
      toast.error('Server error. Please try again shortly.')
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

export default api
