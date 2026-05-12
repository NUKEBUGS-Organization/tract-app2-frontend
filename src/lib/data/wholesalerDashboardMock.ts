import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'

/** Fallback when GET /wholesaler/dashboard is unavailable (dev / offline). */
export interface WholesalerDashboardDeal {
  id: string
  propertyLine: string
  portfolioRef: string
  imageUrl: string
  status: 'under_contract' | 'action_required'
  stepLabel: string
  timerLabel: string
  timerTone: 'green' | 'red'
  timerPulse?: boolean
  primaryAction: 'view' | 'upload'
}

export interface WholesalerDashboardListing {
  id: string
  address: string
  imageUrl: string
  badge: string
  arv: number
  startingBid: number
  viewsLabel: string
  timeLeftLabel: string
}

export interface WholesalerDashboardPayload {
  stats: {
    activeDeals: number
    myListings: number
    reliabilityScore: number
    reliabilityTier: string
    killSwitchAlerts: number
  }
  killSwitch: {
    dealId: string
    headline: string
    detailLine: string
    timerLabel: string
  } | null
  pipeline: WholesalerDashboardDeal[]
  listings: WholesalerDashboardListing[]
}

export const WHOLESALER_DASHBOARD_MOCK: WholesalerDashboardPayload = {
  stats: {
    activeDeals: 2,
    myListings: 5,
    reliabilityScore: 91,
    reliabilityTier: 'Elite',
    killSwitchAlerts: 1,
  },
  killSwitch: {
    dealId: 'A047',
    headline: 'Action Required',
    detailLine: 'Proof of Funds Expiring',
    timerLabel: '11h 23m',
  },
  pipeline: [
    {
      id: '9921',
      propertyLine: '4821 Maple Dr, Austin TX',
      portfolioRef: 'Portfolio #9921',
      imageUrl: DEFAULT_PROPERTY_IMAGE,
      status: 'under_contract',
      stepLabel: 'Inspection Phase',
      timerLabel: '47h remaining',
      timerTone: 'green',
      primaryAction: 'view',
    },
    {
      id: 'A047',
      propertyLine: '902 River Bend, Dallas TX',
      portfolioRef: 'Portfolio #A047',
      imageUrl: DEFAULT_PROPERTY_IMAGE,
      status: 'action_required',
      stepLabel: 'Marketing Proof',
      timerLabel: '11h 23m',
      timerTone: 'red',
      timerPulse: true,
      primaryAction: 'upload',
    },
  ],
  listings: [
    {
      id: '1',
      address: '221B Baker St, Houston TX',
      imageUrl: DEFAULT_PROPERTY_IMAGE,
      badge: 'Live • 4 Bids',
      arv: 425_000,
      startingBid: 310_000,
      viewsLabel: '1.2k Views',
      timeLeftLabel: '2d Left',
    },
    {
      id: '2',
      address: '742 Evergreen Terr, San Antonio',
      imageUrl: DEFAULT_PROPERTY_IMAGE,
      badge: 'Live • 12 Bids',
      arv: 280_000,
      startingBid: 195_000,
      viewsLabel: '4.5k Views',
      timeLeftLabel: '6h Left',
    },
  ],
}
