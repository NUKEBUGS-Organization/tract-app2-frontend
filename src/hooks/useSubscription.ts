import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

export interface SubscriptionStatus {
  required: boolean; amount: number | null; active: boolean; status: string
  paidUntil: string | null; canCancel: boolean; termsVersion: string
}
export function useSubscription() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: ['subscription', user?.id], enabled: Boolean(user),
    queryFn: async () => (await api.get<{ data: SubscriptionStatus }>('/subscriptions/me')).data.data,
    staleTime: 10_000, refetchInterval: 15_000, refetchOnWindowFocus: true,
  })
}
export function useSubscriptionAction(action: 'paypal' | 'refresh' | 'cancel') {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async () => (await api.post<{ data: SubscriptionStatus & { approvalUrl?: string } }>(`/subscriptions/${action}`, action === 'paypal' ? { termsVersion: '2026-09-07' } : {})).data.data,
    onSuccess: (data) => {
      void client.invalidateQueries({ queryKey: ['subscription'] })
      if (data.approvalUrl) {
        const url = new URL(data.approvalUrl)
        if (url.protocol !== 'https:' || !['www.paypal.com', 'www.sandbox.paypal.com', 'paypal.com', 'sandbox.paypal.com'].includes(url.hostname)) throw new Error('Invalid PayPal approval URL')
        window.location.assign(url.href)
      }
    },
  })
}
