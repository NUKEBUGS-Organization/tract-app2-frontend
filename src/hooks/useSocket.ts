import { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getOrCreateSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'

export const SOCKET_EVENTS = {
  BID_PLACED: 'bid:placed',
  BID_COUNT_UPDATED: 'bid:count_updated',
  DEAL_STEP_ADVANCED: 'deal:step_advanced',
  CHAT_MESSAGE: 'chat:message',
  KILL_SWITCH_ALERT: 'kill_switch:alert',
  LISTING_CLOSED: 'listing:closed',
  DEAL_FROZEN: 'deal:frozen',
  BACKUP_PROMOTED: 'deal:backup_promoted',
  JOIN_LISTING_ROOM: 'listing:join',
  JOIN_DEAL_ROOM: 'deal:join',
  LEAVE_ROOM: 'room:leave',
} as const

// ── Hook: connect and subscribe to listing events ─────────────
export function useListingSocket(listingId: string | undefined) {
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!listingId || !token) return

    const socket = getOrCreateSocket(token)
    socket.emit(SOCKET_EVENTS.JOIN_LISTING_ROOM, { listingId })

    const onBidCount = (data: { listingId: string; bidCount: number }) => {
      if (data.listingId !== listingId) return
      void queryClient.invalidateQueries({ queryKey: ['listings', listingId] })
      void queryClient.invalidateQueries({ queryKey: ['listings', 'live'] })
    }

    const onBidPlaced = (data: { listingId: string }) => {
      if (data.listingId !== listingId) return
      void queryClient.invalidateQueries({ queryKey: ['listings', listingId] })
      void queryClient.invalidateQueries({ queryKey: ['listings', 'live'] })
    }

    const onListingClosed = (data: { listingId: string }) => {
      if (data.listingId !== listingId) return
      void queryClient.invalidateQueries({ queryKey: ['listings', listingId] })
    }

    socket.on(SOCKET_EVENTS.BID_COUNT_UPDATED, onBidCount)
    socket.on(SOCKET_EVENTS.BID_PLACED, onBidPlaced)
    socket.on(SOCKET_EVENTS.LISTING_CLOSED, onListingClosed)

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { room: `listing:${listingId}` })
      socket.off(SOCKET_EVENTS.BID_COUNT_UPDATED, onBidCount)
      socket.off(SOCKET_EVENTS.BID_PLACED, onBidPlaced)
      socket.off(SOCKET_EVENTS.LISTING_CLOSED, onListingClosed)
    }
  }, [listingId, token, queryClient])
}

// ── Hook: connect and subscribe to deal events ────────────────
export function useDealSocket(dealId: string | undefined) {
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!dealId || !token) return

    const socket = getOrCreateSocket(token)
    socket.emit(SOCKET_EVENTS.JOIN_DEAL_ROOM, { dealId })

    const onStep = (data: { dealId: string; currentStep: string }) => {
      if (data.dealId !== dealId) return
      void queryClient.invalidateQueries({ queryKey: ['deals', dealId] })
    }

    const onFrozen = (data: { dealId: string }) => {
      if (data.dealId !== dealId) return
      void queryClient.invalidateQueries({ queryKey: ['deals', dealId] })
    }

    const onBackup = (data: { dealId: string }) => {
      if (data.dealId !== dealId) return
      void queryClient.invalidateQueries({ queryKey: ['deals', dealId] })
    }

    socket.on(SOCKET_EVENTS.DEAL_STEP_ADVANCED, onStep)
    socket.on(SOCKET_EVENTS.DEAL_FROZEN, onFrozen)
    socket.on(SOCKET_EVENTS.BACKUP_PROMOTED, onBackup)

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { room: `deal:${dealId}` })
      socket.off(SOCKET_EVENTS.DEAL_STEP_ADVANCED, onStep)
      socket.off(SOCKET_EVENTS.DEAL_FROZEN, onFrozen)
      socket.off(SOCKET_EVENTS.BACKUP_PROMOTED, onBackup)
    }
  }, [dealId, token, queryClient])
}

// ── Hook: subscribe to chat messages ──────────────────────────
export function useChatSocket(
  dealId: string | undefined,
  onNewMessage: (msg: { messageId: string; senderId: string; content: string; createdAt: string }) => void,
) {
  const token = useAuthStore((s) => s.accessToken)
  const callbackRef = useRef(onNewMessage)
  callbackRef.current = onNewMessage

  const handler = useCallback(
    (data: {
      dealId: string
      messageId: string
      senderId: string
      content: string
      createdAt: string
    }) => {
      if (data.dealId !== dealId) return
      callbackRef.current({
        messageId: data.messageId,
        senderId: data.senderId,
        content: data.content,
        createdAt: data.createdAt,
      })
    },
    [dealId],
  )

  useEffect(() => {
    if (!dealId || !token) return

    const socket = getOrCreateSocket(token)
    socket.emit(SOCKET_EVENTS.JOIN_DEAL_ROOM, { dealId })
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handler)

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, { room: `deal:${dealId}` })
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handler)
    }
  }, [dealId, token, handler])
}

export { disconnectSocket } from '@/lib/socket'
