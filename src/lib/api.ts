import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
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
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (status !== 401 || !original) {
      return Promise.reject(error)
    }

    // Wrong password / public auth failures — do not attempt refresh or hard redirect
    if (!original.headers.Authorization) {
      return Promise.reject(error)
    }

    if (original._retry) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if ((original.url ?? '').includes('/auth/refresh')) {
      clearAuthStorage()
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    original._retry = true
    const newToken = await refreshAccessToken()
    if (!newToken) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    original.headers.Authorization = `Bearer ${newToken}`
    return api(original)
  },
)

export default api
