import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface TitleStats {
  activeDeals: number
  pendingEmds: number
  closingThisWeek: number
  dealsNeedingAction: number
}

export interface TitleDealRow {
  id: string
  listingId: string
  propertyLine: string
  city: string
  stateCode: string
  buyerName: string
  wholesalerName: string
  currentStep: string
  stepLabel: string
  stepNumber: number
  totalSteps: number
  nextAction: string
  needsAction: boolean
  advanceLabel: string | null
  emdStatus: string
  emdAmount: number
  closingDate: string | null
}

export interface PendingEmd {
  dealId: string
  propertyLine: string
  buyerName: string
  emdAmount: number
  emdStatus: string
  depositedAt: string | null
}

export interface TitleDashboardData {
  stats: TitleStats
  activeDeals: TitleDealRow[]
  pendingEmds: PendingEmd[]
}

export function useTitleDashboard() {
  return useQuery<TitleDashboardData>({
    queryKey: ['title', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TitleDashboardData>>('/title/dashboard')
      return data.data
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 2,
  })
}

export function useAdvanceTitleStep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dealId: string) => {
      const { data } = await api.post<ApiResponse<{ currentStep: string; stepLabel: string }>>(`/title/deals/${dealId}/advance`)
      return data.data
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['title', 'dashboard'] })
      toast.success(`Advanced to ${result.stepLabel}`)
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

export function useConfirmEmd() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dealId: string) => {
      const { data } = await api.post<ApiResponse<{ emdStatus: string }>>(`/title/deals/${dealId}/confirm-emd`)
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['title', 'dashboard'] })
      toast.success('EMD receipt confirmed.')
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      toast.error(msg ?? 'Failed to confirm EMD.')
    },
  })
}
