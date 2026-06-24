import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, User } from '@/types'

export function useSubmitPof() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: async (data: { documentType: string; documentUrl: string }) => {
      const res = await api.post('/users/me/pof', data)
      return res.data.data
    },
    onSuccess: async () => {
      try {
        const res = await api.get<ApiResponse<User>>('/auth/me')
        setUser(res.data.data)
      } catch {
        /* refresh optional */
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Proof of funds submitted. Pending admin review.')
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to submit proof of funds.'
      toast.error(message)
    },
  })
}

export function useApprovePof() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.post(`/admin/users/${userId}/pof/approve`)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('POF approved.')
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to approve POF.'
      toast.error(message)
    },
  })
}

export function useRejectPof() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const res = await api.post(`/admin/users/${userId}/pof/reject`, { reason })
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('POF rejected.')
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to reject POF.'
      toast.error(message)
    },
  })
}
