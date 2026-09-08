import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getOrCreateSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'

export interface TitleRepRequest extends Record<string, unknown> {
  _id?: string
  id?: string
  currentStep?: string
  /** Step the admin would advance this deal to, or null once it is closed. */
  nextStep?: string | null
  /** True while the admin is the only party who can move this deal forward. */
  awaitingAdmin?: boolean
  disputeFrozen?: boolean
  buyerFailed?: boolean
  emdAmount?: number
  createdAt?: string
  listingId?: {
    propertyAddress?: string
    city?: string
    stateCode?: string
    zipCode?: string
  }
  primaryBuyerId?: { fullName?: string; email?: string }
  wholesalerId?: { fullName?: string; email?: string }
  contractId?: { signedPdfUrl?: string; assignmentFeeFinal?: number }
}

export const TITLE_REQUESTS_KEY = ['admin', 'title-requests'] as const

export function useTitleRepRequests() {
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token) return
    const socket = getOrCreateSocket(token)
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: TITLE_REQUESTS_KEY })
    }
    socket.on('deal:step_advanced', refresh)
    return () => {
      socket.off('deal:step_advanced', refresh)
    }
  }, [token, queryClient])

  return useQuery<TitleRepRequest[]>({
    queryKey: TITLE_REQUESTS_KEY,
    queryFn: async () => {
      const { data } = await api.get('/deals/title-requests')
      return data.data
    },
    refetchInterval: 15_000,
  })
}

/**
 * Advance any deal from the admin queue. Unlike `useAdvanceStep`, this is not
 * bound to a single deal id, so one instance serves the whole list.
 */
export function useAdvanceTitleRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dealId, step }: { dealId: string; step: string }) => {
      const { data } = await api.post(`/deals/${dealId}/advance`, { step })
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TITLE_REQUESTS_KEY })
      void queryClient.invalidateQueries({ queryKey: ['deals'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'all-deals'] })
      toast.success('Deal advanced.')
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { data?: { message?: string | string[] } } }
      const message = ax.response?.data?.message
      toast.error(
        Array.isArray(message) ? message.join(', ') : (message ?? 'Could not advance this deal.'),
      )
    },
  })
}
