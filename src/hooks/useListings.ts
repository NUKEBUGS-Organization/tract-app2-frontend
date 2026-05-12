import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/api'
import { mapApiListing } from '@/lib/mapListing'
import type { ApiResponse, MarketplaceListing } from '@/types'

interface QueryParams {
  stateCode?: string
  dealType?: string
  minProfit?: number
  maxFee?: number
  page?: number
  limit?: number
}

interface LiveStreamResponse {
  listings: MarketplaceListing[]
  total: number
  page: number
}

function errMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string | string[] } } }
  const m = ax.response?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  if (typeof m === 'string') return m
  return 'Request failed.'
}

// ── Fetch live listings (buyer marketplace) ───────────────────
export function useLiveListings(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['listings', 'live', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<LiveStreamResponse>>('/listings', { params })
      const raw = data.data as unknown as {
        listings: Record<string, unknown>[]
        total: number
        page: number
      }
      return {
        listings: raw.listings.map((r) => mapApiListing(r)),
        total: raw.total,
        page: raw.page,
      }
    },
    staleTime: 30_000,
  })
}

// ── Fetch wholesaler's own listings ──────────────────────────
export function useMyListings() {
  return useQuery({
    queryKey: ['listings', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>('/listings/mine')
      return (data.data as Record<string, unknown>[]).map((r) => mapApiListing(r))
    },
    staleTime: 30_000,
  })
}

// ── Fetch single listing ──────────────────────────────────────
export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ['listings', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/listings/${id}`)
      return mapApiListing(data.data as Record<string, unknown>)
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

// ── Create listing (draft) ────────────────────────────────────
export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<ApiResponse<Record<string, unknown>>>('/listings', payload)
      return mapApiListing(data.data as Record<string, unknown>)
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ['listings', 'mine'] })
      queryClient.setQueryData(['listings', listing.id], listing)
      toast.success('Listing created as draft.')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Update listing ────────────────────────────────────────────
export function useUpdateListing(listingId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (!listingId) throw new Error('Missing listing id')
      const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
        `/listings/${listingId}`,
        payload,
      )
      return mapApiListing(data.data as Record<string, unknown>)
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ['listings', listing.id] })
      queryClient.invalidateQueries({ queryKey: ['listings', 'mine'] })
      queryClient.setQueryData(['listings', listing.id], listing)
      toast.success('Listing saved.')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Publish listing ───────────────────────────────────────────
export function usePublishListing(listingId: string | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      if (!listingId) throw new Error('Missing listing id')
      const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
        `/listings/${listingId}/publish`,
      )
      return mapApiListing(data.data as Record<string, unknown>)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      toast.success('Listing published to marketplace!')
      navigate('/wholesaler/listings/compliance-pending')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Place bid ─────────────────────────────────────────────────
export function usePlaceBid(listingId: string | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: { assignmentPrice: number; specialTerms?: string }) => {
      if (!listingId) throw new Error('Missing listing id')
      const { data } = await api.post<ApiResponse<unknown>>('/bids', {
        listingId,
        ...payload,
      })
      return data.data
    },
    onSuccess: () => {
      if (listingId) {
        queryClient.invalidateQueries({ queryKey: ['listings', listingId] })
      }
      queryClient.invalidateQueries({ queryKey: ['bids', 'mine'] })
      toast.success('Bid placed successfully!')
      navigate('/buyer/dashboard')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Get bids for a listing (wholesaler) ──────────────────────
export function useListingBids(listingId: string | undefined) {
  return useQuery({
    queryKey: ['bids', 'listing', listingId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<unknown>>(`/bids/listing/${listingId}`)
      return data.data
    },
    enabled: Boolean(listingId),
    staleTime: 15_000,
  })
}

// ── Get buyer's own bids ──────────────────────────────────────
export function useMyBids() {
  return useQuery({
    queryKey: ['bids', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<unknown>>('/bids/mine')
      return data.data
    },
    staleTime: 30_000,
  })
}
