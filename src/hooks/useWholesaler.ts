import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import { WHOLESALER_DASHBOARD_MOCK } from '@/lib/data/wholesalerDashboardMock'

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
}

function bidsFromBadge(badge: string): number {
  const match = badge.match(/(\d+)\s*Bids/i)
  return match ? parseInt(match[1], 10) : 0
}

function devDashboardFallback(): WholesalerDashboardData {
  const m = WHOLESALER_DASHBOARD_MOCK
  return {
    stats: {
      ...m.stats,
      totalBidsReceived: m.listings.reduce((s, l) => s + bidsFromBadge(l.badge), 0),
    },
    killSwitch: m.killSwitch
      ? {
          dealId: m.killSwitch.dealId,
          listingId: '',
          headline: m.killSwitch.headline,
          detailLine: m.killSwitch.detailLine,
          timerLabel: m.killSwitch.timerLabel,
          hoursLeft: 11,
        }
      : null,
    pipeline: m.pipeline.map((p) => ({
      id: p.id,
      listingId: p.id,
      propertyLine: p.propertyLine,
      portfolioRef: p.portfolioRef,
      imageUrl: p.imageUrl,
      status: p.status,
      currentStep: 'inspection_period',
      stepLabel: p.stepLabel,
      timerLabel: p.timerLabel,
      timerTone: p.timerTone,
      timerPulse: p.timerPulse ?? false,
      primaryAction: p.primaryAction,
      marketingProofUploaded: p.status === 'under_contract',
      marketingProofDeadline: null,
    })),
    listings: m.listings.map((l) => {
      const parts = l.address.split(',')
      const addr = parts[0]?.trim() ?? l.address
      const rest = parts.slice(1).join(',').trim()
      return {
        id: l.id,
        address: addr,
        city: rest || '—',
        stateCode: '',
        imageUrl: l.imageUrl,
        status: 'live',
        bidCount: bidsFromBadge(l.badge),
        arv: l.arv,
        assignmentFeeHigh: l.startingBid,
        projectedBuyerProfit: 0,
        publishedAt: null,
        bidsOpen: true,
      }
    }),
  }
}

export function useWholesalerDashboard() {
  return useQuery<WholesalerDashboardData>({
    queryKey: ['wholesaler', 'dashboard'],
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<WholesalerDashboardData>>('/wholesaler/dashboard')
        return data.data
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[useWholesalerDashboard] API failed, using dev mock', err)
          return devDashboardFallback()
        }
        throw err
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: 2,
  })
}
