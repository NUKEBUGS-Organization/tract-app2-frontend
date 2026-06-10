import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (data: { fullName?: string; stateCode?: string }) => {
      const res = await api.patch<{ success: boolean; data: User }>('/users/me', data)
      return res.data.data
    },
    onSuccess: (user) => {
      setUser(user)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Profile updated successfully.')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to update profile.')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await api.post<{ success: boolean; data: { message: string } }>('/auth/change-password', data)
      return res.data.data
    },
    onSuccess: () => {
      toast.success('Password changed successfully.')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to change password.')
    },
  })
}
