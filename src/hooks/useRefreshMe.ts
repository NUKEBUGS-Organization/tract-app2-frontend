import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, User } from '@/types'

export function useRefreshMe() {
  return useMutation({
    mutationFn: async (): Promise<User> => {
      const res = await api.get<ApiResponse<User>>('/auth/me')
      return res.data.data
    },
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user)
    },
  })
}
