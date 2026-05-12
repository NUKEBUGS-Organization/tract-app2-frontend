import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'

export interface BuyerListingDetail {
  id: string
  headlineAddress: string
  heroImageUrl: string
  verified: boolean
  dealTypeLabel: string
  arv: number
  purchasePrice: number
  rehab: number
  holding: number
  projectedProfit: number
  roiPct: number
  yearBuilt: number
  propertyTypeShort: string
  wholesaler: {
    name: string
    avatarUrl: string
    closedDeals: number
    ratingLabel: string
    memberTenure: string
  }
  bidsPlaced: number
  bidSlotsMax: number
}

export const BUYER_LISTING_MAPLE_MOCK: BuyerListingDetail = {
  id: 'mkt-1',
  headlineAddress: '4821 Maple Drive, Austin, TX',
  heroImageUrl: DEFAULT_PROPERTY_IMAGE,
  verified: true,
  dealTypeLabel: 'Fix & Flip',
  arv: 320_000,
  purchasePrice: 185_000,
  rehab: 45_500,
  holding: 37_100,
  projectedProfit: 52_400,
  roiPct: 16.4,
  yearBuilt: 1998,
  propertyTypeShort: 'SFH',
  wholesaler: {
    name: 'Julian Vance',
    avatarUrl: DEFAULT_AVATAR_IMAGE,
    closedDeals: 7,
    ratingLabel: '4.8★',
    memberTenure: '8m',
  },
  bidsPlaced: 4,
  bidSlotsMax: 10,
}

export function buyerListingMockForId(id: string): BuyerListingDetail {
  return { ...BUYER_LISTING_MAPLE_MOCK, id }
}
