import { test, expect } from '@playwright/test'

test('marketplace renders API property photos and the signed-in avatar', async ({ page }) => {
  const avatarUrl = 'https://media.example.test/avatar.png'
  const photoUrl = 'https://media.example.test/property.png'
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhE8AAAAASUVORK5CYII=', 'base64')
  await page.route('https://media.example.test/**', route => route.fulfill({ contentType: 'image/png', body: image }))
  await page.route('**/api/v1/**', async route => {
    const path = new URL(route.request().url()).pathname
    let data: unknown = []
    if (path.endsWith('/auth/refresh')) data = { accessToken: 'mock-session' }
    if (path.endsWith('/auth/me')) data = {
      id: 'buyer', fullName: 'Photo Buyer', email: 'buyer@example.test', role: 'buyer',
      avatarUrl, kycStatus: 'approved', bankVerified: true, stateCode: 'TX', phone: '1234567890',
    }
    if (path.endsWith('/listings')) data = {
      listings: [{ _id: 'listing', propertyAddress: '123 Photo Street', city: 'Austin', stateCode: 'TX',
        status: 'live', dealType: 'cash', photoUrls: [photoUrl], arv: 300000,
        assignmentFeeHigh: 25000, projectedBuyerProfit: 75000, createdAt: new Date().toISOString(),
        wholesalerId: { _id: 'seller', fullName: 'Seller' } }], total: 1, page: 1,
    }
    await route.fulfill({ json: { success: true, data } })
  })
  await page.goto('/buyer/marketplace')
  for (const src of [avatarUrl, photoUrl]) {
    const img = page.locator(`img[src="${src}"]`).first()
    await expect(img).toBeVisible()
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0)
  }
})
