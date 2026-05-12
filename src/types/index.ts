export type UserRole =
  | 'seller'
  | 'wholesaler'
  | 'realtor'
  | 'buyer'
  | 'title_rep'
  | 'admin'
export type KycStatus = 'pending' | 'in_progress' | 'approved' | 'rejected'
export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'live'
  | 'under_contract'
  | 'closed'
  | 'cancelled'
export type BidStatus = 'active' | 'primary' | 'backup_2' | 'backup_3' | 'working' | 'rejected'
export type DealStep =
  | 'contract_signed'
  | 'emd_deposited'
  | 'inspection_period'
  | 'appraisal_ordered'
  | 'financing_approved'
  | 'title_search_complete'
  | 'clear_to_close'
  | 'funded_closed'
export type DealType = 'fix_flip' | 'hold_sell' | 'full_gut' | 'new_construction'
export type MarketStatus = 'off_market' | 'on_market'

export interface User {
  id: string
  email: string
  phone: string
  role: UserRole
  fullName: string
  stateCode?: string

  // KYC
  kycStatus: KycStatus
  kycVerifiedAt?: string | null
  bankVerified: boolean

  // Scores — shared across both apps
  reliabilityScore: number
  professionalScore: number

  // Restrictions — shared across both apps
  isBanned: boolean
  banReason?: string | null
  scoreRestrictedUntil?: string | null

  // App 2 specific
  app2_activeDealsCount: number
  app2_totalDealsClosed: number
  app2_isVettedBuyer: boolean
  app2_reactivationFeePending: boolean
  app2_platformFeePaid: boolean

  // Realtor specific
  licenseNumber?: string | null
  brokerageName?: string | null
  commissionPct?: number | null
  defaultAgencyRole?: 'buyers_agent' | 'transaction_coordinator' | null

  // Timestamps
  lastActiveAt?: string | null
  createdAt: string
}

export interface MarketplaceListing {
  id: string
  wholesalerId: string
  wholesaler: Pick<User, 'id' | 'fullName' | 'reliabilityScore'>
  status: ListingStatus
  propertyAddress: string
  city: string
  stateCode: string
  zipCode: string
  dealType: DealType
  marketStatus: MarketStatus
  arv: number
  rehabTotal: number
  assignmentFeeHigh: number
  assignmentFeeLow?: number
  projectedBuyerProfit: number
  bidCount: number
  feeLocked: boolean
  publishedAt?: string | null
  createdAt: string
  photoUrls?: string[]
  videoUrl?: string
  purchasePrice?: number
  estimatedHoldingCosts?: number
  rehabBreakdown?: Record<string, number>
  bidsOpen?: boolean
}

export interface MarketplaceBid {
  id: string
  listingId: string
  buyerId: string
  buyer: Pick<User, 'id' | 'fullName' | 'reliabilityScore'>
  assignmentPrice: number
  specialTerms?: string
  status: BidStatus
  backupPosition?: number
  submittedAt: string
}

export interface MarketplaceDeal {
  id: string
  contractId?: string
  listingId: string | MarketplaceListing | { _id: string; propertyAddress?: string; stateCode?: string; dealType?: DealType; arv?: number }
  primaryBuyerId: string
  primaryBuyer: Pick<User, 'id' | 'fullName'>
  wholesalerId: string
  wholesaler?: Pick<User, 'id' | 'fullName'>
  titleRepId?: string
  titleRep?: Pick<User, 'id' | 'fullName'>
  currentStep: DealStep
  buyerFailed: boolean
  emdForfeited: boolean
  disputeFrozen: boolean
  closedAt?: string
  createdAt: string
  marketingProofDeadline?: string
  marketingProofUploaded?: boolean
  emdAmount?: number
  emdStatus?: string
  titleCompanyName?: string
  titleCompanyEmail?: string
  emdWiringInstructions?: string
  backup2BuyerId?: string
  backup3BuyerId?: string
  backupActivationDeadline?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ChatMessage {
  _id: string
  dealId: string
  senderId: Pick<User, 'id' | 'fullName' | 'role'> | string
  content: string
  isFlagged: boolean
  flagType?: string | null
  isBlocked: boolean
  blockedReason?: string | null
  isSystemMessage: boolean
  readAt?: string | null
  createdAt: string
}

export interface PenaltyRecord {
  _id: string
  violationType: string
  scoreDeduction: number
  automatedPenalties: string[]
  createdAt: string
  resolved: boolean
}

export interface ScoreData {
  reliabilityScore: number
  professionalScore: number
  tier: string
  app2_activeDeals: number
  app2_totalClosed: number
  penalties: PenaltyRecord[]
}

export const DEAL_STEP_ORDER: DealStep[] = [
  'contract_signed',
  'emd_deposited',
  'inspection_period',
  'appraisal_ordered',
  'financing_approved',
  'title_search_complete',
  'clear_to_close',
  'funded_closed',
]

/** Steps 4–8 on backend — only title rep or admin may advance. */
export const TITLE_REP_ADVANCE_STEPS = new Set<DealStep>([
  'appraisal_ordered',
  'financing_approved',
  'title_search_complete',
  'clear_to_close',
  'funded_closed',
])
