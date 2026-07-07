import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface AppNotification {
  id: string
  userId: string
  dealId: string | null
  listingId: string | null
  channel: string
  title: string
  body: string
  type: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AppNotification[]>>('/notifications')
      return res.data.data ?? []
    },
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`)
      return res.data.data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
