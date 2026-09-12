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
    refetchInterval: 5_000,
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
      void queryClient.invalidateQueries({ queryKey: ['deals'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'all-deals'] })
      toast.success('Pipeline step advanced.')
    },
    onError: (err: unknown) => {
      toast.error(errMessage(err))
    },
  })
}

export function useTitleHandling(dealId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (titleHandling: 'own_rep' | 'tract') => {
      const { data } = await api.post(`/deals/${dealId}/title-handling`, { titleHandling })
      return data.data
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['deals', dealId] }) },
    onError: (err: unknown) => toast.error(errMessage(err)),
  })
}

export function useTitlePackage(dealId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await api.get(`/deals/${dealId}/title-package`, { responseType: 'blob', timeout: 45_000 })
        if (data instanceof Blob && data.type.includes('application/json')) {
          const body = JSON.parse(await data.text()) as { message?: string | string[] }
          const message = Array.isArray(body.message) ? body.message.join(', ') : body.message
          throw new Error(message ?? 'Could not download title package.')
        }
        const url = URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.download = `title-package-${dealId}.zip`
        link.click()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      } catch (error) {
        const err = error as { response?: { data?: Blob | { message?: string | string[] }; status?: number } }
        if (error instanceof Error && !(err.response?.data instanceof Blob) && err.response == null) {
          throw error
        }
        if (err.response?.data instanceof Blob) {
          try {
            const body = JSON.parse(await err.response.data.text()) as { message?: string | string[] }
            const message = Array.isArray(body.message) ? body.message.join(', ') : body.message
            throw new Error(message ?? 'Could not download title package.')
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Could not download title package.') throw parseErr
            throw new Error('Could not download title package.')
          }
        }
        const nested = err.response?.data
        if (nested && typeof nested === 'object' && 'message' in nested) {
          const message = Array.isArray(nested.message) ? nested.message.join(', ') : nested.message
          throw new Error(message ?? 'Could not download title package.')
        }
        throw error instanceof Error ? error : new Error('Could not download title package.')
      }
    },
    onError: (error: unknown) => toast.error(error instanceof Error ? error.message : 'Could not download title package.'),
  })
}

// ── Upload marketing proof ────────────────────────────────────
export function useUploadMarketingProof(dealId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      if (!dealId) throw new Error('Missing deal id')
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Choose a PDF file.')
      }
      if (file.type && file.type !== 'application/pdf') {
        throw new Error('Choose a PDF file.')
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('PDF must be 10 MB or smaller.')
      }
      const body = new FormData()
      body.append('file', file)
      const { data } = await api.post<ApiResponse<unknown>>(
        `/deals/${dealId}/marketing-proof`,
        body,
        { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 90_000 },
      )
      return data.data
    },
    onSuccess: () => {
      if (dealId) {
        void queryClient.invalidateQueries({ queryKey: ['deals', dealId] })
        void queryClient.invalidateQueries({ queryKey: ['wholesaler'] })
      }
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
      const { data } = await api.post<ApiResponse<ChatMessage>>('/chat', {
        dealId,
        content,
      })
      return data.data
    },
    onSuccess: (message) => {
      // A blocked message is accepted (201) but never delivered — tell the
      // sender instead of letting it silently vanish.
      if (message?.isBlocked) {
        toast.warning(
          'Message blocked — sharing contact info or outside links in deal chat is not allowed. Repeated attempts can lower your reliability score.',
        )
      }
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
