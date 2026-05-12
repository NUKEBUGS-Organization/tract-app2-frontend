import type { MarketplaceListing, User } from '@/types'

function pickWholesaler(wholesalerId: unknown): {
  wholesalerId: string
  wholesaler: Pick<User, 'id' | 'fullName' | 'reliabilityScore'>
} {
  if (wholesalerId && typeof wholesalerId === 'object' && '_id' in (wholesalerId as object)) {
    const w = wholesalerId as {
      _id: { toString(): string } | string
      fullName?: string
      reliabilityScore?: number
    }
    const id = typeof w._id === 'string' ? w._id : w._id.toString()
    return {
      wholesalerId: id,
      wholesaler: {
        id,
        fullName: w.fullName ?? '',
        reliabilityScore: Number(w.reliabilityScore ?? 0),
      },
    }
  }
  const id = String(wholesalerId ?? '')
  return {
    wholesalerId: id,
    wholesaler: { id, fullName: '', reliabilityScore: 0 },
  }
}

/** Normalizes Mongo lean docs + populated wholesalerId into `MarketplaceListing`. */
export function mapApiListing(row: Record<string, unknown>): MarketplaceListing {
  const id = String(row._id ?? row.id ?? '')
  const { wholesalerId, wholesaler } = pickWholesaler(row.wholesalerId)

  return {
    id,
    wholesalerId,
    wholesaler,
    status: row.status as MarketplaceListing['status'],
    propertyAddress: String(row.propertyAddress ?? ''),
    city: String(row.city ?? ''),
    stateCode: String(row.stateCode ?? ''),
    zipCode: String(row.zipCode ?? ''),
    dealType: row.dealType as MarketplaceListing['dealType'],
    marketStatus: (row.marketStatus as MarketplaceListing['marketStatus']) ?? 'off_market',
    arv: Number(row.arv ?? 0),
    rehabTotal: Number(row.rehabTotal ?? 0),
    assignmentFeeHigh: Number(row.assignmentFeeHigh ?? 0),
    assignmentFeeLow: row.assignmentFeeLow != null ? Number(row.assignmentFeeLow) : undefined,
    projectedBuyerProfit: Number(row.projectedBuyerProfit ?? 0),
    bidCount: Number(row.bidCount ?? 0),
    feeLocked: Boolean(row.feeLocked),
    publishedAt: row.publishedAt != null ? String(row.publishedAt) : null,
    createdAt: String(row.createdAt ?? ''),
    photoUrls: Array.isArray(row.photoUrls) ? (row.photoUrls as string[]) : [],
    videoUrl: row.videoUrl != null ? String(row.videoUrl) : undefined,
    purchasePrice: row.purchasePrice != null ? Number(row.purchasePrice) : undefined,
    estimatedHoldingCosts:
      row.estimatedHoldingCosts != null ? Number(row.estimatedHoldingCosts) : undefined,
    rehabBreakdown:
      row.rehabBreakdown && typeof row.rehabBreakdown === 'object'
        ? (row.rehabBreakdown as Record<string, number>)
        : undefined,
    bidsOpen: row.bidsOpen !== undefined ? Boolean(row.bidsOpen) : true,
  }
}
