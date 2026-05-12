import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/api'
import { disconnectSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/store/authStore'
import { useRegisterStore } from '@/store/registerStore'
import type { User, ApiResponse } from '@/types'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  role: string
  fullName: string
  email: string
  phone: string
  password: string
  stateCode: string
  dob: string
}

/** API returns access + user; refresh is httpOnly cookie (no refreshToken in JSON). */
interface AuthResponse {
  user: User
  accessToken: string
}

function toastApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const raw = error.response?.data as { message?: string | string[] } | undefined
    const m = raw?.message
    const msg = Array.isArray(m) ? m.join(', ') : m ?? fallback
    toast.error(String(msg))
    return
  }
  toast.error(fallback)
}

const ROLE_REDIRECT: Record<string, string> = {
  wholesaler: '/wholesaler/dashboard',
  realtor: '/wholesaler/dashboard',
  buyer: '/buyer/dashboard',
  title_rep: '/title/dashboard',
  admin: '/admin/dashboard',
  seller: '/wholesaler/dashboard',
}

export function useAuth() {
  const navigate = useNavigate()
  const { setSession, logout } = useAuthStore()
  const { reset } = useRegisterStore()

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
      return res.data.data
    },
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
      toast.success('Welcome back!')
      const redirect = ROLE_REDIRECT[data.user.role] ?? '/login'
      navigate(redirect)
    },
    onError: (error: unknown) => {
      toastApiError(error, 'Invalid email or password')
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload)
      return res.data.data
    },
    onSuccess: (data) => {
      setSession(data.accessToken, data.user)
      reset()
      toast.success('Account created! Please verify your identity.')
      navigate('/register/verify')
    },
    onError: (error: unknown) => {
      toastApiError(error, 'Registration failed. Try again.')
    },
  })

  const logoutUser = () => {
    disconnectSocket()
    logout()
    toast.success('Signed out successfully.')
    navigate('/login')
  }

  return {
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    logout: logoutUser,
  }
}
