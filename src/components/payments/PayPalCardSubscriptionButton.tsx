import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { SubscriptionStatus } from '@/hooks/useSubscription'

type CardConfig = {
  clientId: string
  planId: string
  amount: number
  currency: string
  termsVersion: string
  mode: string
}

declare global {
  interface Window {
    paypal?: {
      FUNDING?: { CARD?: string }
      Buttons?: (options: Record<string, unknown>) => { render: (selector: HTMLElement) => Promise<void> }
    }
  }
}

function loadPayPalSdk(clientId: string, currency: string) {
  const id = 'paypal-card-subscription-sdk'
  const existing = document.getElementById(id) as HTMLScriptElement | null
  if (existing) return new Promise<void>((resolve, reject) => {
    if (window.paypal?.Buttons) resolve()
    existing.addEventListener('load', () => resolve(), { once: true })
    existing.addEventListener('error', () => reject(new Error('Could not load PayPal card checkout.')), { once: true })
  })
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.id = id
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription&currency=${encodeURIComponent(currency)}&components=buttons&enable-funding=card&disable-funding=venmo,paylater`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load PayPal card checkout.'))
    document.body.appendChild(script)
  })
}

export default function PayPalCardSubscriptionButton({ disabled }: { disabled?: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const renderedRef = useRef(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    let cancelled = false
    async function render() {
      if (disabled || renderedRef.current || !containerRef.current) return
      try {
        setLoading(true)
        const config = (await api.get<{ data: CardConfig }>('/subscriptions/paypal/card-config')).data.data
        await loadPayPalSdk(config.clientId, config.currency)
        if (cancelled || !containerRef.current || !window.paypal?.Buttons) return
        renderedRef.current = true
        const buttonOptions = {
          style: { layout: 'vertical', label: 'pay', tagline: false },
          createSubscription: (_data: unknown, actions: any) =>
            actions.subscription.create({ plan_id: config.planId, custom_id: user?.id }),
          onApprove: async (data: { subscriptionID?: string }) => {
            if (!data.subscriptionID) throw new Error('PayPal did not return a subscription ID.')
            const status = (await api.post<{ data: SubscriptionStatus }>('/subscriptions/paypal/confirm', {
              subscriptionId: data.subscriptionID,
              termsVersion: config.termsVersion,
            })).data.data
            queryClient.setQueryData(['subscription', user?.id], status)
            await queryClient.invalidateQueries({ queryKey: ['subscription'] })
            await queryClient.invalidateQueries({ queryKey: ['allowance'] })
          },
          onError: (err: unknown) => {
            setError(err instanceof Error ? err.message : 'Card checkout failed. Please retry.')
          },
        }
        try {
          await window.paypal.Buttons({
            ...buttonOptions,
            fundingSource: window.paypal.FUNDING?.CARD,
          }).render(containerRef.current)
        } catch {
          containerRef.current.innerHTML = ''
          await window.paypal.Buttons(buttonOptions).render(containerRef.current)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Card checkout is unavailable. Please retry.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void render()
    return () => { cancelled = true }
  }, [disabled, queryClient, user?.id])

  return (
    <div className="space-y-2">
      {loading ? <p className="text-sm text-app1-text-muted">Loading secure card checkout…</p> : null}
      <div ref={containerRef} />
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}
