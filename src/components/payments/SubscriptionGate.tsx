import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_SUBSCRIPTIONS, useSubscription, useSubscriptionAction } from '@/hooks/useSubscription'

export default function SubscriptionGate({ children }: { children: ReactNode }) {
  const status = useSubscription()
  if (status.isLoading) return <p role="status">Checking subscription…</p>
  if (status.data?.active) return <>{status.data.mock && status.data.required && <p role="status" className="mb-3 text-sm text-app1-primary">Subscription: Paid (test). No payment was processed.</p>}{children}</>
  return <SubscriptionPanel />
}

export function SubscriptionPanel() {
  const status = useSubscription()
  const subscribe = useSubscriptionAction('paypal')
  const refresh = useSubscriptionAction('refresh')
  const cancel = useSubscriptionAction('cancel')
  const [accepted, setAccepted] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const error = status.error || subscribe.error || refresh.error || cancel.error
  const errorText = error && typeof error === 'object' && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : error?.message
  return <section className="rounded-xl border border-app1-border-light bg-app1-bg-card p-6 text-app1-text-main space-y-4">
    <h2 className="text-xl font-bold">SaaS subscription</h2>
    {MOCK_SUBSCRIPTIONS && <p className="text-sm">Test checkout — no PayPal connection or real charge. Test status is saved for this account in this browser.</p>}
    {import.meta.env.DEV && <Link to="/settings/subscription?preview=true" className="text-sm underline">Preview subscription test UI</Link>}
    {status.data?.required === false ? <p>Your role does not require a subscription.</p> : <>
      {status.data && <p className="text-2xl font-semibold">${status.data.amount}<span className="text-sm font-normal"> USD / month</span></p>}
      <p>Monthly access to Buy TRACT’s digital clearinghouse and contract tools. Payment is required before executing a contract or digital assignment.</p>
      <p className="text-sm">Subscription payments are non-refundable, including when a transaction does not close. Earnest money is paid to your title company, not through PayPal.</p>
      {status.data?.active ? <p role="status">{MOCK_SUBSCRIPTIONS ? 'Paid (test). Test access through ' : 'Paid access through '}{new Date(status.data.paidUntil!).toLocaleDateString()}{status.data.status === 'CANCELLED' ? '. Renewal cancelled.' : '.'}</p> : <>
        {!MOCK_SUBSCRIPTIONS && <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
          <span>I agree to monthly recurring billing and the non-refundable subscription terms in the <Link className="underline" to="/legal/terms" target="_blank">Terms of Service</Link>. I can cancel future renewals here.</span></label>}
        <button disabled={(!MOCK_SUBSCRIPTIONS && !accepted) || subscribe.isPending || !status.data} onClick={() => subscribe.mutate()} className="rounded-lg bg-app1-secondary px-5 py-3 text-app1-primary-dark disabled:opacity-50">{subscribe.isPending ? (MOCK_SUBSCRIPTIONS ? 'Updating…' : 'Opening PayPal…') : 'Subscribe with PayPal'}</button>
      </>}
      <button onClick={() => refresh.mutate()} disabled={refresh.isPending} className="ml-3 underline text-sm">{refresh.isPending ? 'Checking…' : 'Check payment status'}</button>
      {status.data?.canCancel && <div>{MOCK_SUBSCRIPTIONS ? <button className="text-sm underline" disabled={cancel.isPending} onClick={() => cancel.mutate()}>Reset test payment</button> : confirmCancel ? <><p>Cancel future renewals? Payments already made are non-refundable; paid access remains until its end date.</p><button className="underline mr-4" onClick={() => cancel.mutate()} disabled={cancel.isPending}>Confirm cancellation</button><button onClick={() => setConfirmCancel(false)}>Keep subscription</button></> : <button className="text-sm underline" onClick={() => setConfirmCancel(true)}>Cancel renewal</button>}</div>}
    </>}
    {error && <p role="alert" className="text-red-600">{errorText || 'Could not verify subscription. Please retry.'}</p>}
  </section>
}
