import type { DealStep, MarketplaceDeal, User } from '@/types'

function refParty(ref: unknown): Pick<User, 'id' | 'fullName'> | undefined {
  if (ref && typeof ref === 'object' && '_id' in (ref as object)) {
    const o = ref as { _id: { toString(): string }; fullName?: string }
    return { id: o._id.toString(), fullName: String(o.fullName ?? '') }
  }
  return undefined
}

function refIdOnly(ref: unknown): string {
  const p = refParty(ref)
  if (p) return p.id
  return String(ref ?? '')
}

/** Normalizes Mongo lean docs + populated refs into `MarketplaceDeal`. */
export function mapApiDeal(row: Record<string, unknown>): MarketplaceDeal {
  const id = String(row._id ?? row.id ?? '')
  const primary = refParty(row.primaryBuyerId)
  const wholesaler = refParty(row.wholesalerId)
  const titleRep = refParty(row.titleRepId)
  const titleRepObj =
    row.titleRepId && typeof row.titleRepId === 'object' && row.titleRepId !== null
      ? (row.titleRepId as { fullName?: string; email?: string })
      : null

  return {
    id,
    listingId: row.listingId as MarketplaceDeal['listingId'],
    primaryBuyerId: refIdOnly(row.primaryBuyerId),
    primaryBuyer: primary ?? { id: refIdOnly(row.primaryBuyerId), fullName: '' },
    wholesalerId: refIdOnly(row.wholesalerId),
    wholesaler,
    titleRepId: row.titleRepId ? refIdOnly(row.titleRepId) : undefined,
    titleRep,
    titleRepName: titleRepObj?.fullName ?? titleRep?.fullName,
    titleRepEmail: titleRepObj?.email,
    currentStep: row.currentStep as DealStep,
    buyerFailed: Boolean(row.buyerFailed),
    emdForfeited: Boolean(row.emdForfeited),
    disputeFrozen: Boolean(row.disputeFrozen),
    closedAt: row.closedAt != null ? String(row.closedAt) : undefined,
    createdAt: String(row.createdAt ?? ''),
    marketingProofDeadline:
      row.marketingProofDeadline != null ? String(row.marketingProofDeadline) : undefined,
    marketingProofUploaded: Boolean(row.marketingProofUploaded),
    emdAmount: row.emdAmount != null ? Number(row.emdAmount) : undefined,
    emdStatus: row.emdStatus != null ? String(row.emdStatus) : undefined,
    titleCompanyName: row.titleCompanyName != null ? String(row.titleCompanyName) : undefined,
    titleCompanyEmail: row.titleCompanyEmail != null ? String(row.titleCompanyEmail) : undefined,
    emdWiringInstructions:
      row.emdWiringInstructions != null ? String(row.emdWiringInstructions) : undefined,
    backup2BuyerId: row.backup2BuyerId ? refIdOnly(row.backup2BuyerId) : undefined,
    backup3BuyerId: row.backup3BuyerId ? refIdOnly(row.backup3BuyerId) : undefined,
    backupActivationDeadline:
      row.backupActivationDeadline != null ? String(row.backupActivationDeadline) : undefined,
  }
}
