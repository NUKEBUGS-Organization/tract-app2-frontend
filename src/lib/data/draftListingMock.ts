import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'

export interface DraftListingDetail {
  id: string
  address: string
  cityStateZip: string
  propertyType: string
  purchasePrice: number
  sellerLabel: string
  checklistTotal: number
  checklistCompleted: number
  heroImageUrl: string
  syncedFromApp1: boolean
}

export const DRAFT_LISTING_MOCK: DraftListingDetail = {
  id: 'draft-4821',
  address: '4821 Maple Drive',
  cityStateZip: 'Austin, TX 78701',
  propertyType: 'Single Family Home',
  purchasePrice: 185_000,
  sellerLabel: 'Verified Seller',
  checklistTotal: 4,
  checklistCompleted: 0,
  heroImageUrl: DEFAULT_PROPERTY_IMAGE,
  syncedFromApp1: true,
}
