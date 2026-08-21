import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'

export type DealPayment = {
  id: string
  dealId: string
  userId: string
  paymentType: string
  party: 'buyer' | 'wholesaler' | string
  amount: number
  currency: string
  status: string
  paypalOrderId: string | null
  processedAt: string | null
  failureReason: string | null
}

export type DealFeesPayload = {
  purchasePriceBasis: number | null
  ratePercent: number
  bothPaid: boolean
  myPayment: DealPayment | null
  payments: DealPayment[]
}

function errMessage(err: unknown): string {
  const ax = err as { response?: { data?: { message?: string | string[] } } }
  const m = ax.response?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  if (typeof m === 'string') return m
  return 'Payment request failed.'
}

export function useDealFees(dealId: string | undefined) {
  return useQuery({
    queryKey: ['payments', 'deal', dealId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DealFeesPayload>>(`/payments/deal/${dealId}`)
      return data.data
    },
    enabled: Boolean(dealId),
    staleTime: 10_000,
    refetchInterval: 20_000,
  })
}

export function useCreatePaypalOrder(dealId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data } = await api.post<
        ApiResponse<{
          alreadyPaid: boolean
          orderId: string | null
          approveUrl: string | null
          payment: DealPayment
        }>
      >('/payments/paypal/create-order', { paymentId })
      return data.data
    },
    onSuccess: (payload) => {
      if (dealId) qc.invalidateQueries({ queryKey: ['payments', 'deal', dealId] })
      if (payload.alreadyPaid) {
        toast.success('Platform fee already paid.')
        return
      }
      if (payload.approveUrl) {
        window.location.href = payload.approveUrl
        return
      }
      toast.error('PayPal did not return an approval link. Try again.')
    },
    onError: (err: unknown) => toast.error(errMessage(err)),
  })
}

export function useCapturePaypalOrder(dealId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { paymentId: string; orderId?: string }) => {
      const { data } = await api.post<ApiResponse<{ payment: DealPayment }>>(
        '/payments/paypal/capture',
        args,
      )
      return data.data
    },
    onSuccess: () => {
      if (dealId) {
        qc.invalidateQueries({ queryKey: ['payments', 'deal', dealId] })
        qc.invalidateQueries({ queryKey: ['deals', dealId] })
      }
      toast.success('Platform fee paid.')
    },
    onError: (err: unknown) => toast.error(errMessage(err)),
  })
}
