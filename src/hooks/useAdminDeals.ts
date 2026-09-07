import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { getOrCreateSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'

export interface AdminDeal extends Record<string, unknown> {
  id?: string
  _id?: string
  titleHandling?: 'own_rep' | 'tract'
  currentStep?: string
  listingId?: { propertyAddress?: string; city?: string; stateCode?: string; zipCode?: string; photoUrls?: string[]; purchasePrice?: number; assignmentFeeLow?: number; assignmentFeeHigh?: number; arv?: number }
  primaryBuyerId?: { fullName?: string }
  wholesalerId?: { fullName?: string }
  contractId?: { signedPdfUrl?: string; assignmentFeeFinal?: number }
}

export function useAdminDeals() {
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!token) return
    const socket = getOrCreateSocket(token)
    const refresh = () => { void queryClient.invalidateQueries({ queryKey: ['admin', 'all-deals'] }) }
    socket.on('deal:step_advanced', refresh)
    return () => { socket.off('deal:step_advanced', refresh) }
  }, [token, queryClient])
  return useQuery<AdminDeal[]>({
    queryKey: ['admin', 'all-deals'],
    queryFn: async () => { const { data } = await api.get('/deals'); return data.data },
    refetchInterval: 15_000,
  })
}
