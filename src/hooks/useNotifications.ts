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

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.patch<ApiResponse<{ updated: number; unreadCount: number }>>(
        '/notifications/read-all',
      )
      return res.data.data
    },
    onSuccess: () => {
      qc.setQueryData<AppNotification[]>(['notifications'], (prev = []) =>
        prev.map((n) => ({ ...n, isRead: true })),
      )
      qc.setQueryData(['notifications', 'count'], 0)
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`)
      return id
    },
    onSuccess: (id) => {
      qc.setQueryData<AppNotification[]>(['notifications'], (prev = []) =>
        prev.filter((n) => n.id !== id),
      )
    },
  })
}

export function useClearAllNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete<ApiResponse<{ deleted: number; unreadCount: number }>>(
        '/notifications',
      )
      return res.data.data
    },
    onSuccess: () => {
      qc.setQueryData<AppNotification[]>(['notifications'], [])
      qc.setQueryData(['notifications', 'count'], 0)
    },
  })
}

// Backward-compatible alias
export const useMarkNotificationRead = useMarkRead
