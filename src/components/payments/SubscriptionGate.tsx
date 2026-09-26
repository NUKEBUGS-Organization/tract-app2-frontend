import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MOCK_SUBSCRIPTIONS, useCouponPreview, useRedeemCoupon, useSubscription, useSubscriptionAction } from '@/hooks/useSubscription'
import PayPalCardSubscriptionButton from '@/components/payments/PayPalCardSubscriptionButton'

export default function SubscriptionGate({ children }: { children: ReactNode }) {
  const status = useSubscription()
  if (status.isLoading) return <p role="status">Checking subscription…</p>
  if (status.data?.active) return <>
    {status.data.coupon && <p role="status" className="mb-3 text-sm text-app1-primary">Coupon {status.data.coupon.code} applied — no subscription fee through {new Date(status.data.coupon.freeUntil).toLocaleDateString()}.</p>}
    {!status.data.coupon && status.data.mock && status.data.required && <p role="status" className="mb-3 text-sm text-app1-primary">Subscription: Paid (test). No payment was processed.</p>}
    {children}
  </>
  return <SubscriptionPanel />
}

function errorTextOf(error: unknown): string | undefined {
  if (!error) return undefined
  if (typeof error === 'object' && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (message) return message
  }
  return error instanceof Error ? error.message : undefined
}

/**
 * Beta coupon entry. Preview validates the code and shows the new total, so the
 * user sees "$100 → $0" before committing; redeem then grants free access for
 * the coupon window without creating a PayPal subscription.
 */
function CouponForm({ amount }: { amount: number | null }) {
  const [code, setCode] = useState('')
  const preview = useCouponPreview()
  const redeem = useRedeemCoupon()
  const quoted = preview.data
  const matchesTyped = quoted && quoted.code === code.trim().toUpperCase()
  const error = errorTextOf(preview.error || redeem.error)

  return (
    <div className="rounded-lg border border-app1-border-light p-4 space-y-3">
      <label htmlFor="coupon-code" className="block text-sm font-bold">Have a coupon code?</label>
      <p className="text-sm text-app1-text-muted">Beta testers can waive the subscription fee entirely.</p>
      <div className="flex flex-wrap gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); preview.reset(); redeem.reset() }}
          placeholder="BETA100"
          autoComplete="off"
          spellCheck={false}
          maxLength={32}
          className="min-w-0 flex-1 rounded-lg border border-app1-border-light px-3 py-2 font-mono uppercase tracking-wider"
        />
        <button
          type="button"
          disabled={!code.trim() || preview.isPending || redeem.isPending}
          onClick={() => preview.mutate(code.trim())}
          className="rounded-lg border border-app1-border-light px-4 py-2 disabled:opacity-50"
        >
          {preview.isPending ? 'Checking…' : 'Apply'}
        </button>
      </div>

      {matchesTyped ? (
        <div role="status" className="space-y-2">
          <p className="text-sm">
            <span className="font-bold">{quoted.code}</span> applied —{' '}
            <span className="line-through text-app1-text-muted">${quoted.amountBefore}</span>{' '}
            <span className="font-bold">${quoted.amountDue}</span> / month, free through{' '}
            {new Date(quoted.freeUntil).toLocaleDateString()}.
          </p>
          <button
            type="button"
            disabled={redeem.isPending}
            onClick={() => redeem.mutate(quoted.code)}
            className="rounded-lg bg-app1-secondary px-5 py-3 text-app1-primary-dark disabled:opacity-50"
          >
            {redeem.isPending ? 'Redeeming…' : `Redeem — pay $${quoted.amountDue} today`}
          </button>
        </div>
      ) : null}

      {amount !== null && !matchesTyped && !error ? (
        <p className="text-xs text-app1-text-muted">Without a coupon you will be billed ${amount}/month.</p>
      ) : null}
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

export function SubscriptionPanel() {
  const status = useSubscription()
  const subscribe = useSubscriptionAction(MOCK_SUBSCRIPTIONS ? 'mock-checkout' : 'paypal')
  const refresh = useSubscriptionAction('refresh')
  const cancel = useSubscriptionAction('cancel')
  const [accepted, setAccepted] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const error = status.error || subscribe.error || refresh.error || cancel.error
  const errorText = error && typeof error === 'object' && 'response' in error
    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : error?.message
  return <section className="rounded-xl border border-app1-border-light bg-app1-bg-card p-6 text-app1-text-main space-y-4">
    <h2 className="text-xl font-bold">SaaS subscription</h2>
    {MOCK_SUBSCRIPTIONS && <p className="text-sm">Test checkout — no PayPal connection or real charge. Test status is saved to this account by the TRACT backend.</p>}
    {import.meta.env.DEV && <Link to="/settings/subscription?preview=true" className="text-sm underline">Preview subscription test UI</Link>}
    {status.data?.required === false ? <p>Your role does not require a subscription.</p> : <>
      {status.data && <p className="text-2xl font-semibold">{status.data.coupon
        ? <><span className="line-through text-app1-text-muted">${status.data.amount}</span> $0</>
        : <>${status.data.amount}</>}<span className="text-sm font-normal"> USD / month</span></p>}
      <p>Monthly access to Buy TRACT’s digital clearinghouse and contract tools. Payment is required before executing a contract or digital assignment.</p>
      <p className="text-sm">Subscription payments are non-refundable, including when a transaction does not close. Earnest money is paid to your title company, not through PayPal.</p>
      {status.data?.active ? <p role="status">{status.data.coupon
        ? `Coupon ${status.data.coupon.code} applied — free access through `
        : MOCK_SUBSCRIPTIONS ? 'Paid (test). Test access through ' : 'Paid access through '}{new Date(status.data.paidUntil!).toLocaleDateString()}{status.data.status === 'CANCELLED' ? '. Renewal cancelled.' : '.'}</p> : <>
        {!MOCK_SUBSCRIPTIONS && <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
          <span>I agree to monthly recurring billing and the non-refundable subscription terms in the <Link className="underline" to="/legal/terms" target="_blank">Terms of Service</Link>. I can cancel future renewals here.</span></label>}
        {MOCK_SUBSCRIPTIONS ? (
          <button disabled={subscribe.isPending || !status.data} onClick={() => subscribe.mutate()} className="rounded-lg bg-app1-secondary px-5 py-3 text-app1-primary-dark disabled:opacity-50">{subscribe.isPending ? 'Updating…' : 'Activate test subscription'}</button>
        ) : (
          <>
            <PayPalCardSubscriptionButton disabled={!accepted || !status.data} />
            <button disabled={!accepted || subscribe.isPending || !status.data} onClick={() => subscribe.mutate()} className="text-sm underline disabled:opacity-50">{subscribe.isPending ? 'Opening PayPal…' : 'Use PayPal account instead'}</button>
          </>
        )}
        <CouponForm amount={status.data?.amount ?? null} />
      </>}
      <button onClick={() => refresh.mutate()} disabled={refresh.isPending} className="ml-3 underline text-sm">{refresh.isPending ? 'Checking…' : 'Check payment status'}</button>
      {status.data?.canCancel && <div>{MOCK_SUBSCRIPTIONS ? <button className="text-sm underline" disabled={cancel.isPending} onClick={() => cancel.mutate()}>Reset test payment</button> : confirmCancel ? <><p>Cancel future renewals? Payments already made are non-refundable; paid access remains until its end date.</p><button className="underline mr-4" onClick={() => cancel.mutate()} disabled={cancel.isPending}>Confirm cancellation</button><button onClick={() => setConfirmCancel(false)}>Keep subscription</button></> : <button className="text-sm underline" onClick={() => setConfirmCancel(true)}>Cancel renewal</button>}</div>}
    </>}
    {error && <p role="alert" className="text-red-600">{errorText || 'Could not verify subscription. Please retry.'}</p>}
  </section>
}
