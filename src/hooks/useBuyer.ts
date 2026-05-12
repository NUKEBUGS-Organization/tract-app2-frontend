import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface BuyerStats {
  activeBids: number
  dealsInProgress: number
  dealsClosed: number
  reliabilityScore: number
  reliabilityTier: string
  isVettedBuyer: boolean
}

export interface ActiveBid {
  id: string
  listingId: string
  propertyLine: string
  city: string
  stateCode: string
  imageUrl: string
  assignmentPrice: number
  status: string
  statusLabel: string
  submittedAt: string
  action: 'view' | 'deal'
  dealId?: string | null
}

export interface ActiveDeal {
  id: string
  listingId: string
  propertyLine: string
  city: string
  stateCode: string
  imageUrl: string
  currentStep: string
  stepLabel: string
  stepNumber: number
  totalSteps: number
  emdStatus: string
  emdAmount: number
  wholesalerName: string
}

export interface RecommendedListing {
  id: string
  propertyAddress: string
  city: string
  stateCode: string
  imageUrl: string
  dealType: string
  arv: number
  rehabTotal: number
  assignmentFeeHigh: number
  projectedBuyerProfit: number
  bidCount: number
  bidsOpen: boolean
  publishedAt: string | null
}

export interface BuyerDashboardData {
  stats: BuyerStats
  activeBids: ActiveBid[]
  activeDeals: ActiveDeal[]
  recommendedListings: RecommendedListing[]
}

export function useBuyerDashboard() {
  return useQuery<BuyerDashboardData>({
    queryKey: ['buyer', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BuyerDashboardData>>('/buyer/dashboard')
      return data.data
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 2,
  })
}
