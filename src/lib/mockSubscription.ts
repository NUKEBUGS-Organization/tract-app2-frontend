export function mockSubscriptionStatus(userId: string, role: string) {
  const amount = role === 'wholesaler' ? 50 : ['buyer', 'realtor'].includes(role) ? 100 : null
  let paidUntil: string | null = null
  try { paidUntil = localStorage.getItem(`tract:test-subscription:${userId}`) } catch { /* Browser storage may be unavailable. */ }
  const paid = Boolean(paidUntil && new Date(paidUntil).getTime() > Date.now())
  return { required: amount !== null, amount, active: amount === null || paid,
    status: paid ? 'PAID_TEST' : 'NONE', paidUntil, canCancel: paid,
    termsVersion: '2026-09-07', mock: true }
}

export function updateMockSubscription(userId: string, role: string, action: 'paypal' | 'refresh' | 'cancel') {
  const status = mockSubscriptionStatus(userId, role)
  if (action === 'paypal') {
    const until = new Date()
    until.setMonth(until.getMonth() + 1)
    status.paidUntil = until.toISOString()
    status.active = true
    status.status = 'PAID_TEST'
    status.canCancel = true
    try { localStorage.setItem(`tract:test-subscription:${userId}`, status.paidUntil) } catch { /* Query cache still updates for this session. */ }
  } else if (action === 'cancel') {
    try { localStorage.removeItem(`tract:test-subscription:${userId}`) } catch { /* Query cache still updates for this session. */ }
    status.active = !status.required
    status.status = 'NONE'
    status.paidUntil = null
    status.canCancel = false
  }
  return status
}
