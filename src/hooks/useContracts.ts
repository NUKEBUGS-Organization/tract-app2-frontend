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
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useCreateContractForListing(
  listingId: string | undefined,
  primaryBidId: string | undefined,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!listingId) throw new Error('Missing listing id')
      if (!primaryBidId) throw new Error('Missing primary bid id')

      const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
        `/contracts/listing/${listingId}`,
        { bidId: primaryBidId },
      )
      return mapApiContract(data.data as Record<string, unknown>)
    },
    onSuccess: () => {
      if (listingId) {
        queryClient.invalidateQueries({
          queryKey: ['contracts', 'listing', listingId],
        })
      }
      toast.success('Contract created.')
    },
    onError: (error: unknown) => {
      toast.error(errMessage(error))
    },
  })
}

export function useOpenContractSigning(
  contractId: string | undefined,
  onOpened?: () => void,
) {
  return useMutation({
    mutationFn: async () => {
      if (!contractId) throw new Error('Missing contract id')
      const { data } = await api.get<ApiResponse<{ embed_src: string }>>(
        `/contracts/${contractId}/sign-url`,
      )
      return data.data.embed_src
    },
    onSuccess: (embedSrc) => {
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
