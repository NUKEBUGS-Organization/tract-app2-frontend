import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/lib/api'
import { mapApiDeal } from '@/lib/mapDeal'
import type { ApiResponse, ChatMessage, ScoreData } from '@/types'

function errMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string | string[] } } }
  const m = ax.response?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  if (typeof m === 'string') return m
  return 'Request failed.'
}

// ── Get single deal ───────────────────────────────────────────
export function useDeal(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deals', dealId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/deals/${dealId}`)
      return mapApiDeal(data.data as Record<string, unknown>)
    },
    enabled: Boolean(dealId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

// ── Get my deals ──────────────────────────────────────────────
export function useMyDeals() {
  return useQuery({
    queryKey: ['deals', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>('/deals')
      return (data.data as Record<string, unknown>[]).map((r) => mapApiDeal(r))
    },
    staleTime: 30_000,
  })
}

// ── Advance pipeline step ─────────────────────────────────────
export function useAdvanceStep(dealId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (step: string) => {
      if (!dealId) throw new Error('Missing deal id')
      const { data } = await api.post<ApiResponse<unknown>>(`/deals/${dealId}/advance`, { step })
      return data.data
    },
    onSuccess: () => {
      if (dealId) queryClient.invalidateQueries({ queryKey: ['deals', dealId] })
      toast.success('Pipeline step advanced.')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Upload marketing proof ────────────────────────────────────
export function useUploadMarketingProof(dealId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proofUrl: string) => {
      if (!dealId) throw new Error('Missing deal id')
      const { data } = await api.post<ApiResponse<unknown>>(`/deals/${dealId}/marketing-proof`, {
        proofUrl,
      })
      return data.data
    },
    onSuccess: () => {
      if (dealId) queryClient.invalidateQueries({ queryKey: ['deals', dealId] })
      toast.success('Marketing proof uploaded. Kill switch cancelled.')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Assign title company ──────────────────────────────────────
export function useAssignTitleCompany(dealId: string | undefined) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: {
      titleCompanyName: string
      titleCompanyEmail: string
      emdWiringInstructions?: string
    }) => {
      if (!dealId) throw new Error('Missing deal id')
      const { data } = await api.post<ApiResponse<unknown>>(`/deals/${dealId}/title-company`, payload)
      return data.data
    },
    onSuccess: () => {
      if (dealId) queryClient.invalidateQueries({ queryKey: ['deals', dealId] })
      toast.success('Title company assigned.')
      navigate(`/deals/${dealId}/emd`)
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

interface ChatThreadPayload {
  messages: ChatMessage[]
  total: number
  page: number
}

// ── Get chat messages ─────────────────────────────────────────
export function useChatMessages(dealId: string | undefined) {
  return useQuery({
    queryKey: ['chat', dealId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ChatThreadPayload>>(`/chat/${dealId}`)
      return data.data
    },
    enabled: Boolean(dealId),
    staleTime: 5_000,
    refetchInterval: 10_000,
    retry: false,
  })
}

// ── Send chat message ─────────────────────────────────────────
export function useSendMessage(dealId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      if (!dealId) throw new Error('Missing deal id')
      const { data } = await api.post<ApiResponse<unknown>>('/chat', {
        dealId,
        content,
      })
      return data.data
    },
    onSuccess: () => {
      if (dealId) queryClient.invalidateQueries({ queryKey: ['chat', dealId] })
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Submit post-close rating ──────────────────────────────────
export function useSubmitRating() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: { dealId: string; stars: number; comment?: string }) => {
      const { data } = await api.post<ApiResponse<unknown>>('/ratings', payload)
      return data.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals', variables.dealId] })
      toast.success('Rating submitted. Thank you!')
      navigate('/buyer/dashboard')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

// ── Get user reliability score ────────────────────────────────
export function useMyScore() {
  return useQuery({
    queryKey: ['score', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ScoreData>('/users/me/score')
      return data
    },
    staleTime: 60_000,
  })
}
