import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface AppNotification {
  id: string
  userId: string
  dealId: string | null
  listingId: string | null
  channel: string
  type: string
  title: string
  body: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export function useNotifications() {
  return useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AppNotification[]>>('/notifications')
      return res.data.data ?? []
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function useUnreadCount() {
  const { data: notifications = [] } = useNotifications()
  return notifications.filter((n) => !n.isRead).length
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<ApiResponse<AppNotification>>(`/notifications/${id}/read`)
      return res.data.data
    },
    onSuccess: (updated) => {
      if (!updated) return
      qc.setQueryData<AppNotification[]>(['notifications'], (prev = []) =>
        prev.map((n) => (n.id === updated.id ? { ...n, isRead: true } : n)),
      )
    },
  })
}

// Backward-compatible alias
export const useMarkNotificationRead = useMarkRead
