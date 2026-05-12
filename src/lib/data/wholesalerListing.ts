import api from '@/lib/api'
import { DRAFT_LISTING_MOCK, type DraftListingDetail } from '@/lib/data/draftListingMock'

export async function fetchDraftListing(id: string): Promise<DraftListingDetail> {
  try {
    const { data } = await api.get<DraftListingDetail>(`/wholesaler/listings/${id}`)
    return data
  } catch {
    return { ...DRAFT_LISTING_MOCK, id }
  }
}
