import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { applyMockCoupon, mockSubscriptionStatus, updateMockSubscription } from '@/lib/mockSubscription'
import { useAuthStore } from '@/store/authStore'

// Beta currently uses UI-only checkout. Set both frontend and backend to paypal when connecting billing.
export const MOCK_SUBSCRIPTIONS = import.meta.env.VITE_SUBSCRIPTION_MODE !== 'paypal'

export interface AppliedCoupon {
  code: string; amountWaived: number | null; freeUntil: string
}
export interface SubscriptionStatus {
  required: boolean; amount: number | null; active: boolean; status: string
  paidUntil: string | null; canCancel: boolean; termsVersion: string
  /** What is owed right now: 0 while a coupon is applied, otherwise `amount`. */
  amountDue?: number | null
  coupon?: AppliedCoupon | null
  mock?: boolean
}
export interface CouponPreview {
  code: string; description: string
  amountBefore: number; amountDue: number; percentOff: number; freeUntil: string
}
export interface UsageAllowance {
  used: number; freeLimit: number; remaining: number; subscriptionRequired: boolean
}
export function useSubscription() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['subscription', user?.id], enabled: Boolean(user),
    queryFn: async () => {
      if (!user) throw new Error('Sign in to continue.')
      if (MOCK_SUBSCRIPTIONS) return mockSubscriptionStatus(user.id, user.role)
      return (await api.get<{ data: SubscriptionStatus }>('/subscriptions/me')).data.data
    },
    staleTime: MOCK_SUBSCRIPTIONS ? Infinity : 10_000,
    refetchInterval: MOCK_SUBSCRIPTIONS ? false : 15_000,
    refetchOnWindowFocus: !MOCK_SUBSCRIPTIONS,
  })
}
export function useAllowance(kind: 'listing' | 'bid') {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['allowance', user?.id, kind], enabled: Boolean(user),
    queryFn: async () => (await api.get<{ data: UsageAllowance }>(`/subscriptions/allowance/${kind}`)).data.data,
    staleTime: 10_000,
  })
}
/**
 * Coupons are tracked by the backend in every mode — a redemption is real state
 * about a real account, not part of the UI-only mock checkout.
 */
export function useCouponPreview() {
  return useMutation({
    mutationFn: async (code: string) =>
      (await api.post<{ data: CouponPreview }>('/subscriptions/coupon/preview', { code })).data.data,
  })
}

export function useRedeemCoupon() {
  const client = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (code: string) =>
      (await api.post<{ data: SubscriptionStatus }>('/subscriptions/coupon/redeem', { code })).data.data,
    onSuccess: (data) => {
      client.setQueryData(['subscription', user?.id], data)
      if (user) applyMockCoupon(user.id, data)
      void client.invalidateQueries({ queryKey: ['subscription'] })
      void client.invalidateQueries({ queryKey: ['allowance'] })
    },
  })
}

export function useSubscriptionAction(action: 'paypal' | 'mock-checkout' | 'refresh' | 'cancel') {
  const client = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (): Promise<SubscriptionStatus & { approvalUrl?: string }> => {
      if (!user) throw new Error('Sign in to continue.')
      if (MOCK_SUBSCRIPTIONS) {
        if (action === 'mock-checkout') {
          const status = updateMockSubscription(user.id, user.role, 'paypal')
          void api.post('/subscriptions/mock-checkout', {}).catch(() => undefined)
          return status
        }
        if (action === 'cancel') return updateMockSubscription(user.id, user.role, 'cancel')
        if (action === 'refresh') return updateMockSubscription(user.id, user.role, 'refresh')
      }
      return (await api.post<{ data: SubscriptionStatus & { approvalUrl?: string } }>(`/subscriptions/${action}`, action === 'paypal' ? { termsVersion: '2026-09-07' } : {})).data.data
    },
    onSuccess: (data) => {
      client.setQueryData(['subscription', user?.id], data)
      if (!MOCK_SUBSCRIPTIONS) {
        void client.invalidateQueries({ queryKey: ['subscription'] })
        void client.invalidateQueries({ queryKey: ['allowance'] })
      }
      if (data.approvalUrl) {
        const url = new URL(data.approvalUrl)
        if (url.protocol !== 'https:' || !['www.paypal.com', 'www.sandbox.paypal.com', 'paypal.com', 'sandbox.paypal.com'].includes(url.hostname)) throw new Error('Invalid PayPal approval URL')
        window.location.assign(url.href)
      }
    },
  })
}
