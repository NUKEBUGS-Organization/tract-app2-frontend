import { expect, test, type Route } from '@playwright/test'

const realtor = {
  id: 'realtor-subscription',
  _id: 'realtor-subscription',
  fullName: 'Subscription Realtor',
  email: 'subscription-realtor@example.test',
  phone: '+15550001111',
  role: 'realtor',
  reliabilityScore: 100,
  kycStatus: 'approved',
  pofStatus: 'approved',
}

async function json(route: Route, data: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data }),
  })
}

test('mock PayPal checkout stays paid even when backend status would refetch unpaid', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('tract:test-subscription:realtor-subscription')
  })
  await page.route('**/api/v1/auth/refresh', (route) => json(route, { accessToken: 'subscription-token' }))
  await page.route('**/api/v1/auth/me', (route) => json(route, realtor))
  await page.route('**/api/v1/subscriptions/me', (route) =>
    json(route, {
      required: true,
      amount: 100,
      active: false,
      status: 'NONE',
      paidUntil: null,
      canCancel: false,
      termsVersion: '2026-09-07',
      mock: true,
    }),
  )
  await page.route('**/api/v1/subscriptions/mock-checkout', (route) =>
    json(route, {
      required: true,
      amount: 100,
      active: true,
      status: 'PAID_TEST',
      paidUntil: new Date(Date.now() + 30 * 86400_000).toISOString(),
      canCancel: true,
      termsVersion: '2026-09-07',
      mock: true,
    }),
  )

  await page.goto('/settings/subscription')
  await expect(page.getByRole('button', { name: /subscribe with paypal/i })).toBeVisible()

  await page.getByRole('button', { name: /subscribe with paypal/i }).click()

  await expect(page.getByRole('status').filter({ hasText: /paid \(test\)/i })).toBeVisible()
  await page.waitForTimeout(500)
  await expect(page.getByRole('button', { name: /subscribe with paypal/i })).toHaveCount(0)
})
