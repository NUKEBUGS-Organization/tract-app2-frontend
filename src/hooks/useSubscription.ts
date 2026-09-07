import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { mockSubscriptionStatus, updateMockSubscription } from '@/lib/mockSubscription'

// Beta currently uses UI-only checkout. Set both frontend and backend to paypal when connecting billing.
export const MOCK_SUBSCRIPTIONS = import.meta.env.VITE_SUBSCRIPTION_MODE !== 'paypal'

export interface SubscriptionStatus {
  required: boolean; amount: number | null; active: boolean; status: string
  paidUntil: string | null; canCancel: boolean; termsVersion: string
  mock?: boolean
}
export function useSubscription() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['subscription', user?.id], enabled: Boolean(user),
    queryFn: async () => MOCK_SUBSCRIPTIONS
      ? mockSubscriptionStatus(user!.id, user!.role)
      : (await api.get<{ data: SubscriptionStatus }>('/subscriptions/me')).data.data,
    staleTime: 10_000, refetchInterval: 15_000, refetchOnWindowFocus: true,
  })
}
export function useSubscriptionAction(action: 'paypal' | 'refresh' | 'cancel') {
  const client = useQueryClient()
  const user = useAuthStore((s) => s.user)
  return useMutation({
    mutationFn: async (): Promise<SubscriptionStatus & { approvalUrl?: string }> => {
      if (!user) throw new Error('Sign in to continue.')
      return MOCK_SUBSCRIPTIONS ? updateMockSubscription(user.id, user.role, action)
        : (await api.post<{ data: SubscriptionStatus & { approvalUrl?: string } }>(`/subscriptions/${action}`, action === 'paypal' ? { termsVersion: '2026-09-07' } : {})).data.data
    },
    onSuccess: (data) => {
      client.setQueryData(['subscription', user?.id], data)
      if (!MOCK_SUBSCRIPTIONS) void client.invalidateQueries({ queryKey: ['subscription'] })
      if (data.approvalUrl) {
        const url = new URL(data.approvalUrl)
        if (url.protocol !== 'https:' || !['www.paypal.com', 'www.sandbox.paypal.com', 'paypal.com', 'sandbox.paypal.com'].includes(url.hostname)) throw new Error('Invalid PayPal approval URL')
        window.location.assign(url.href)
      }
    },
  })
}
