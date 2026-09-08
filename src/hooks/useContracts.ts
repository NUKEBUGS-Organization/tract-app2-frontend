import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import { mapApiContract } from '@/lib/mapContract'
import type { ApiResponse } from '@/types'

function errMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string | string[] } } }
  const m = ax.response?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  if (typeof m === 'string') return m
  return 'Request failed.'
}

export function useContractByListing(listingId: string | undefined) {
  return useQuery({
    queryKey: ['contracts', 'listing', listingId],
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
          `/contracts/listing/${listingId}`,
        )
        return mapApiContract(data.data as Record<string, unknown>)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    enabled: Boolean(listingId),
    staleTime: 0,
    // Poll while pending so DocuSeal signatures show without manual refresh.
    // GET also syncs from DocuSeal (heals missed webhooks).
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'pending') return 1_500
      return false
    },
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  })
}

export function useCreateContractForListing(
  listingId: string | undefined,
  primaryBidId: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file?: File) => {
      if (!listingId) throw new Error('Missing listing id')
      if (!primaryBidId) throw new Error('Missing primary bid id')

      const body = file ? new FormData() : { bidId: primaryBidId }
      if (body instanceof FormData) { body.append('bidId', primaryBidId); body.append('file', file!); body.append('realtorSigned', 'true') }
      const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
        `/contracts/listing/${listingId}`,
        body,
        { headers: file ? { 'Content-Type': 'multipart/form-data' } : undefined, timeout: 90_000 },
      )
      return mapApiContract(data.data as Record<string, unknown>)
    },
    onSuccess: (contract) => {
      if (listingId) {
        queryClient.setQueryData(['contracts', 'listing', listingId], contract)
        void queryClient.invalidateQueries({ queryKey: ['contracts', 'listing', listingId] })
      }
      void queryClient.invalidateQueries({ queryKey: ['contracts'] })
      void queryClient.invalidateQueries({ queryKey: ['deals'] })
      void queryClient.invalidateQueries({ queryKey: ['wholesaler'] })
      void queryClient.invalidateQueries({ queryKey: ['buyer'] })
      toast.success('Contract created.')
    },
    onError: (error: unknown) => {
      toast.error(errMessage(error))
    },
  })
}


export function useUploadSignedContract(contractId: string | undefined, listingId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      if (!contractId) throw new Error('Missing contract id')
      const body = new FormData()
      body.append('file', file)
      body.append('buyerSigned', 'true')
      const { data } = await api.post<ApiResponse<Record<string, unknown>>>(`/contracts/${contractId}/signed-upload`, body, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90_000 })
      return mapApiContract(data.data)
    },
    onSuccess: (contract) => {
      queryClient.setQueryData(['contracts', 'listing', listingId], contract)
      void queryClient.invalidateQueries({ queryKey: ['contracts'] })
      void queryClient.invalidateQueries({ queryKey: ['deals'] })
      void queryClient.invalidateQueries({ queryKey: ['wholesaler'] })
      void queryClient.invalidateQueries({ queryKey: ['buyer'] })
      toast.success('Signed contract uploaded.')
    },
    onError: (error: unknown) => toast.error(errMessage(error)),
  })
}

export function useOpenContractSigning(
  contractId: string | undefined,
  onOpened?: () => void,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      if (!contractId) throw new Error('Missing contract id')
      const { data } = await api.get<ApiResponse<{ embed_src: string }>>(
        `/contracts/${contractId}/sign-url`,
      )
      return data.data.embed_src
    },
    onSuccess: (embedSrc) => {
      // Sign-url also syncs DocuSeal on the server — refresh any cached contract rows.
      void queryClient.invalidateQueries({ queryKey: ['contracts'] })
      const signingWindow = window.open(embedSrc, '_blank')
      if (signingWindow) {
        signingWindow.opener = null
        onOpened?.()
        return
      }
      toast.error('Popup was blocked. Please allow popups and try again.')
    },
    onError: (error: unknown) => {
      toast.error(errMessage(error))
    },
  })
}

export function useCancelContract(listingId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contractId: string) => {
      const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
        `/contracts/${contractId}/cancel`,
      )
      return data.data
    },
    onSuccess: () => {
      if (listingId) {
        queryClient.invalidateQueries({ queryKey: ['contracts', 'listing', listingId] })
        queryClient.invalidateQueries({ queryKey: ['bids', 'listing', listingId] })
        queryClient.invalidateQueries({ queryKey: ['listings', listingId] })
      }
      void queryClient.invalidateQueries({ queryKey: ['contracts', 'mine'] })
      toast.success('Contract cancelled. Listing reopened for bids.')
    },
    onError: (error: unknown) => {
      toast.error(errMessage(error))
    },
  })
}

export function useMyContracts() {
  return useQuery({
    queryKey: ['contracts', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<
        ApiResponse<{ data: Record<string, unknown>[]; pagination?: unknown }>
      >('/contracts/my-contracts')
      const payload = data.data
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : []
      return rows.map((r) => mapApiContract(r))
    },
    staleTime: 15_000,
    refetchInterval: 5_000,
  })
}
