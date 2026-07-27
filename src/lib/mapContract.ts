import type { MarketplaceContract, User } from '@/types'

function refParty(
  ref: unknown,
): Pick<User, 'id' | 'fullName' | 'role'> | undefined {
  if (ref && typeof ref === 'object' && '_id' in (ref as object)) {
    const o = ref as {
      _id: { toString(): string }
      fullName?: string
      role?: User['role']
    }
    return {
      id: o._id.toString(),
      fullName: String(o.fullName ?? ''),
      role: (o.role ?? 'buyer') as User['role'],
    }
  }
  return undefined
}

function refIdOnly(ref: unknown): string {
  const party = refParty(ref)
  if (party) return party.id
  if (ref && typeof ref === 'object' && '_id' in (ref as object)) {
    return String((ref as { _id: unknown })._id)
  }
  return String(ref ?? '')
}

export function mapApiContract(
  row: Record<string, unknown>,
): MarketplaceContract {
  const wholesaler = refParty(row.wholesalerId)
  const buyer = refParty(row.buyerId)

  return {
    id: String(row._id ?? row.id ?? ''),
    listingId: refIdOnly(row.listingId),
    bidId: row.bidId != null ? refIdOnly(row.bidId) : undefined,
    wholesalerId:
      wholesaler ?? refIdOnly(row.wholesalerId),
    buyerId: buyer ?? refIdOnly(row.buyerId),
    status: String(row.status ?? 'pending') as MarketplaceContract['status'],
    assignmentFeeFinal: Number(row.assignmentFeeFinal ?? 0),
    pdfUrl: row.pdfUrl != null ? String(row.pdfUrl) : null,
    signedPdfUrl: row.signedPdfUrl != null ? String(row.signedPdfUrl) : null,
    auditLogUrl: row.auditLogUrl != null ? String(row.auditLogUrl) : null,
    wholesalerSignedAt:
      row.wholesalerSignedAt != null ? String(row.wholesalerSignedAt) : null,
    buyerSignedAt: row.buyerSignedAt != null ? String(row.buyerSignedAt) : null,
    docusealSubmissionId:
      row.docusealSubmissionId != null
        ? String(row.docusealSubmissionId)
        : null,
    createdAt: row.createdAt != null ? String(row.createdAt) : undefined,
    updatedAt: row.updatedAt != null ? String(row.updatedAt) : undefined,
  }
}
