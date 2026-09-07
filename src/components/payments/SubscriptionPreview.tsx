import { useState } from 'react'
import { Link } from 'react-router-dom'

/** Local development preview only. Never reads or writes payment entitlement. */
export default function SubscriptionPreview() {
  const [tier, setTier] = useState('wholesaler')
  const [accepted, setAccepted] = useState(false)
  const [state, setState] = useState<'unpaid' | 'checkout' | 'paid' | 'cancelled'>('unpaid')
  const amount = tier === 'wholesaler' ? 50 : 100
  return <section className="space-y-5 rounded-xl border border-app1-secondary bg-app1-bg-card p-6 text-app1-text-main">
    <p className="text-sm font-bold uppercase tracking-wide text-app1-secondary">Test UI — no payment is processed</p>
    <h1 className="text-2xl font-semibold">Monthly SaaS subscription</h1>
    <p className="text-sm">Preview the PayPal flow while sandbox credentials are pending. This preview does not unlock real contracts.</p>
    <label className="block">Subscription tier<select className="mt-2 block w-full rounded-lg border bg-app1-bg-soft p-3" value={tier} onChange={event => { setTier(event.target.value); setState('unpaid'); setAccepted(false) }}>
      <option value="wholesaler">Wholesaler / Asset Provider</option><option value="buyer">Buyer / Investor</option><option value="realtor">Licensed Realtor</option>
    </select></label>
    <p className="text-3xl font-semibold">${amount}.00 <span className="text-base font-normal">USD / month</span></p>
    <p>Non-refundable monthly access to contract and clearinghouse tools, regardless of whether a transaction closes. Earnest money is handled by the title company.</p>
    {state === 'unpaid' && <><label className="flex items-start gap-3"><input className="mt-1" type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} /><span>I agree to recurring monthly billing and the <Link to="/legal/terms" target="_blank" className="underline">subscription terms</Link>.</span></label>
      <button className="rounded-lg bg-app1-secondary px-5 py-3 text-app1-primary-dark disabled:opacity-50" disabled={!accepted} onClick={() => setState('checkout')}>Preview PayPal checkout</button></>}
    {state === 'checkout' && <div className="space-y-3 border-t pt-4"><h2 className="font-semibold">Simulated PayPal approval</h2><p>In the connected flow, PayPal asks you to approve ${amount}.00 each month.</p><button className="rounded-lg bg-app1-secondary px-4 py-2 text-app1-primary-dark" onClick={() => setState('paid')}>Simulate successful payment</button><button className="ml-4 underline" onClick={() => setState('unpaid')}>Cancel checkout</button></div>}
    {state === 'paid' && <div role="status" className="space-y-3"><p>Test payment successful. Monthly renewal is enabled in this preview.</p><button className="underline" onClick={() => setState('cancelled')}>Simulate cancelling renewal</button></div>}
    {state === 'cancelled' && <p role="status">Test renewal cancelled. A real subscription retains its already-paid access until the billing period ends.</p>}
    {state !== 'unpaid' && <button className="text-sm underline" onClick={() => { setState('unpaid'); setAccepted(false) }}>Reset preview</button>}
  </section>
}
