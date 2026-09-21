const PAID_KEY = (userId: string) => `tract:test-subscription:${userId}`
const COUPON_KEY = (userId: string) => `tract:subscription-coupon:${userId}`

type StoredCoupon = { code: string; amountWaived: number | null; freeUntil: string }

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null /* Browser storage may be unavailable. */
  }
}

function readCoupon(userId: string): StoredCoupon | null {
  const raw = read(COUPON_KEY(userId))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredCoupon
    return new Date(parsed.freeUntil).getTime() > Date.now() ? parsed : null
  } catch {
    return null
  }
}

export function mockSubscriptionStatus(userId: string, role: string) {
  const amount = role === 'wholesaler' ? 50 : ['buyer', 'realtor'].includes(role) ? 100 : null
  const coupon = readCoupon(userId)

  // A redeemed coupon is real backend state, so it outranks the UI-only test payment.
  if (coupon && amount !== null) {
    return { required: true, amount, amountDue: 0, active: true, status: 'COUPON',
      paidUntil: coupon.freeUntil, canCancel: false, termsVersion: '2026-09-07',
      coupon, mock: false }
  }

  const paidUntil = read(PAID_KEY(userId))
  const paid = Boolean(paidUntil && new Date(paidUntil).getTime() > Date.now())
  return { required: amount !== null, amount, amountDue: amount, active: amount === null || paid,
    status: paid ? 'PAID_TEST' : 'NONE', paidUntil, canCancel: paid,
    termsVersion: '2026-09-07', coupon: null, mock: true }
}

/** Mirror a backend coupon redemption locally so mock mode shows $0 after a reload. */
export function applyMockCoupon(
  userId: string,
  status: { coupon?: StoredCoupon | null; paidUntil?: string | null },
) {
  const coupon = status.coupon
  if (!coupon) return
  try {
    localStorage.setItem(COUPON_KEY(userId), JSON.stringify(coupon))
  } catch {
    /* Query cache still updates for this session. */
  }
}

export function updateMockSubscription(userId: string, role: string, action: 'paypal' | 'refresh' | 'cancel') {
  const status = mockSubscriptionStatus(userId, role)
  // A coupon covers the fee outright; there is nothing to test-pay or reset.
  if (status.coupon) return status
  if (action === 'paypal') {
    const until = new Date()
    until.setMonth(until.getMonth() + 1)
    status.paidUntil = until.toISOString()
    status.active = true
    status.status = 'PAID_TEST'
    status.canCancel = true
    try { localStorage.setItem(PAID_KEY(userId), status.paidUntil) } catch { /* Query cache still updates for this session. */ }
  } else if (action === 'cancel') {
    try { localStorage.removeItem(PAID_KEY(userId)) } catch { /* Query cache still updates for this session. */ }
    status.active = !status.required
    status.status = 'NONE'
    status.paidUntil = null
    status.canCancel = false
  }
  return status
}
