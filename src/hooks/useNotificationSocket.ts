import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getOrCreateSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import type { AppNotification } from '@/hooks/useNotifications'

export function useNotificationSocket() {
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!token) return

    const socket = getOrCreateSocket(token)

    const onNew = (notification: AppNotification) => {
      queryClient.setQueryData<AppNotification[]>(['notifications'], (prev = []) => {
        const id = notification.id
        if (prev.some((n) => n.id === id)) return prev
        return [notification, ...prev]
      })
    }

    const onCount = ({ unreadCount }: { unreadCount: number }) => {
      queryClient.setQueryData(['notifications', 'count'], unreadCount)
    }

    socket.on('notification:new', onNew)
    socket.on('notification:count', onCount)

    return () => {
      socket.off('notification:new', onNew)
      socket.off('notification:count', onCount)
    }
  }, [token, queryClient])
}
