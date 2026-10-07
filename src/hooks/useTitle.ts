import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getOrCreateSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import type { ApiResponse, DealStep } from '@/types'

export interface TitleStats {
  activeDeals: number
  closingThisWeek: number
  dealsNeedingAction: number
  closedDeals: number
}

export interface TitleDealRow {
  id: string
  listingId: string
  propertyLine: string
  city: string
  stateCode: string
  buyerName: string
  wholesalerName: string
  currentStep: DealStep
  stepLabel: string
  stepNumber: number
  totalSteps: number
  nextAction: string
  /** Step the title rep can advance to right now, or null. */
  nextStep: DealStep | null
  needsAction: boolean
  advanceLabel: string | null
  emdAmount: number
  assignedAt: string | null
  closingDate: string | null
}

export interface TitleDashboardData {
  stats: TitleStats
  activeDeals: TitleDealRow[]
}

const TITLE_DASHBOARD_KEY = ['title', 'dashboard'] as const

export function useTitleDashboard() {
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()

  // New assignments and step changes arrive over the socket.
  useEffect(() => {
    if (!token) return
    const socket = getOrCreateSocket(token)
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: TITLE_DASHBOARD_KEY })
    }
    socket.on('deal:step_advanced', refresh)
    return () => {
      socket.off('deal:step_advanced', refresh)
    }
  }, [token, queryClient])

  return useQuery<TitleDashboardData>({
    queryKey: TITLE_DASHBOARD_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TitleDashboardData>>('/title/dashboard')
      return data.data
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 2,
  })
}

/** Advances through the shared deal pipeline so its guards and notifications apply. */
export function useAdvanceTitleStep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ dealId, step }: { dealId: string; step: DealStep }) => {
      const { data } = await api.post(`/deals/${dealId}/advance`, { step })
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TITLE_DASHBOARD_KEY })
      void queryClient.invalidateQueries({ queryKey: ['deals'] })
      toast.success('Deal advanced.')
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error(msg ?? 'Failed to advance step.')
    },
  })
}
