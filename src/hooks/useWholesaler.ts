import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export interface DashboardStats {
  activeDeals: number
  myListings: number
  totalBidsReceived: number
  reliabilityScore: number
  reliabilityTier: string
  killSwitchAlerts: number
}

export interface KillSwitchAlert {
  dealId: string
  listingId: string
  headline: string
  detailLine: string
  timerLabel: string
  hoursLeft: number
}

export interface PipelineDeal {
  id: string
  listingId: string
  propertyLine: string
  portfolioRef: string
  imageUrl: string
  status: string
  currentStep: string
  stepLabel: string
  timerLabel: string
  timerTone: 'green' | 'red'
  timerPulse: boolean
  primaryAction: 'view' | 'upload'
  marketingProofUploaded: boolean
  marketingProofDeadline: string | null
  contractSignedAt: string | null
  emdDepositedAt: string | null
  inspectionCompletedAt: string | null
  appraisalOrderedAt: string | null
  financingApprovedAt: string | null
  titleSearchCompleteAt: string | null
  clearToCloseAt: string | null
  closedAt: string | null
}

export interface ActiveListing {
  id: string
  address: string
  city: string
  stateCode: string
  imageUrl: string
  status: string
  bidCount: number
  arv: number
  assignmentFeeHigh: number
  projectedBuyerProfit: number
  publishedAt: string | null
  bidsOpen: boolean
}

export interface WholesalerDashboardData {
  stats: DashboardStats
  killSwitch: KillSwitchAlert | null
  pipeline: PipelineDeal[]
  listings: ActiveListing[]
  app1Bids: App1BidSummary[]
}

export type App1BidSummary = {
  sourceApp: 'app1'
  bidId: string
  listingId: string
  listingAddress: string
  bidPrice: number
  status: string
  submittedAt: string
  role: 'wholesaler' | 'realtor'
}

export function useWholesalerDashboard() {
  return useQuery<WholesalerDashboardData>({
    queryKey: ['wholesaler', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WholesalerDashboardData>>('/wholesaler/dashboard')
      return data.data
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 2,
  })
}
