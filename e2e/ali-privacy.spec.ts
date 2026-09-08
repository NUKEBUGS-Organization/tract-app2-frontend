import { test, expect, type Page, type Route } from '@playwright/test'

const buyer = {
  id: 'buyer-privacy',
  _id: 'buyer-privacy',
  fullName: 'Privacy Buyer',
  email: 'privacy-buyer@example.test',
  phone: '+15550001010',
  role: 'buyer',
  reliabilityScore: 100,
  kycStatus: 'approved',
  pofStatus: 'approved',
}

const listing = {
  _id: 'listing-privacy',
  id: 'listing-privacy',
  status: 'live',
  propertyAddress: '100 Privacy Lane',
  city: 'Austin',
  stateCode: 'TX',
  zipCode: '78701',
  dealType: 'assignment',
  marketStatus: 'off_market',
  arv: 320000,
  purchasePrice: 185000,
  rehabTotal: 45500,
  rehabBreakdown: { Roof: 15000, HVAC: 8500 },
  estimatedHoldingCosts: 7200,
  assignmentFeeLow: 190000,
  assignmentFeeHigh: 230000,
  projectedBuyerProfit: 38000,
  bidCount: 0,
  bidsOpen: true,
  publishedAt: '2026-09-08T00:00:00.000Z',
  createdAt: '2026-09-08T00:00:00.000Z',
  photoUrls: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
  wholesalerId: {
    _id: 'lister-privacy',
    fullName: 'Listing Realtor',
    role: 'realtor',
    reliabilityScore: 98,
    avatarUrl: null,
  },
}

const deal = {
  _id: 'deal-privacy',
  id: 'deal-privacy',
  listingId: listing,
  primaryBidId: 'bid-privacy',
  primaryBuyerId: { _id: buyer.id, fullName: buyer.fullName, avatarUrl: null },
  wholesalerId: { _id: 'lister-privacy', fullName: 'Listing Realtor', avatarUrl: null },
  currentStep: 'contract_signed',
  createdAt: '2026-09-08T00:00:00.000Z',
  contractSignedAt: '2026-09-08T00:00:00.000Z',
  emdAmount: 5000,
  emdStatus: 'pending',
  emdWiringInstructions: 'Hidden wire instructions',
}

const contract = {
  _id: 'contract-privacy',
  id: 'contract-privacy',
  listingId: listing._id,
  bidId: 'bid-privacy',
  wholesalerId: { _id: 'lister-privacy', id: 'lister-privacy', fullName: 'Listing Realtor', role: 'realtor', avatarUrl: null },
  buyerId: { _id: buyer.id, id: buyer.id, fullName: buyer.fullName, role: 'buyer', avatarUrl: null },
  status: 'pending',
  signingMethod: 'docuseal',
  assignmentFeeFinal: 199999,
  emdAmount: 5000,
  pdfUrl: 'https://example.test/contract.pdf',
  signedPdfUrl: null,
  wholesalerSignedAt: '2026-09-08T00:00:00.000Z',
  buyerSignedAt: null,
  docusealSubmissionId: 'submission-privacy',
}

async function json(route: Route, data: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data }),
  })
}

async function mockBuyerSession(page: Page) {
  await page.route('**/api/v1/auth/refresh', (route) => json(route, { accessToken: 'privacy-token' }))
  await page.route('**/api/v1/auth/me', (route) => json(route, buyer))
  await page.route('**/api/v1/subscriptions/me', (route) => json(route, {
    required: true,
    amount: 100,
    active: true,
    status: 'PAID_TEST',
    mock: true,
  }))
  await page.route('**/api/v1/subscriptions/allowance/bid', (route) => json(route, {
    kind: 'bid',
    freeLimit: 10,
    used: 0,
    remaining: 10,
  }))
}

async function bodyText(page: Page) {
  await expect(page.locator('body')).toBeVisible()
  return page.locator('body').innerText()
}

function expectNoPrivateBuyerText(text: string) {
  expect(text).not.toMatch(/Rehab Cost Estimate|Assignment fee|EMD Status|EMD_Wire|Purchase price|Holding costs|Your earnings/i)
  expect(text).not.toContain('$185,000')
  expect(text).not.toContain('$45,500')
  expect(text).not.toContain('$5,000')
  expect(text).not.toContain('Hidden wire instructions')
}

test.describe('Ali buyer privacy checks', () => {
  test('buyer bid page hides seller financials and submits no EMD', async ({ page }) => {
    await mockBuyerSession(page)
    await page.route('**/api/v1/listings/listing-privacy', (route) => json(route, listing))
    let bidPayload: Record<string, unknown> | null = null
    await page.route('**/api/v1/bids', async (route) => {
      if (route.request().method() !== 'POST') return route.continue()
      bidPayload = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>
      await json(route, { _id: 'bid-privacy', listingId: listing._id, assignmentPrice: 221000, status: 'submitted' })
    })

    await page.goto('/buyer/listings/listing-privacy')
    await expect(page.getByRole('heading', { name: /submit property bid/i })).toBeVisible()
    expectNoPrivateBuyerText(await bodyText(page))

    await page.locator('#bid-amount').fill('221000')
    await page.locator('#closing-date').fill('2026-10-15')
    await page.getByRole('button', { name: /place bid/i }).click()

    await expect.poll(() => bidPayload).not.toBeNull()
    expect(bidPayload).toMatchObject({ listingId: 'listing-privacy', assignmentPrice: 221000 })
    expect(bidPayload).not.toHaveProperty('emdAmount')
  })

  test('buyer deal tracker hides EMD and seller financials', async ({ page }) => {
    await mockBuyerSession(page)
    await page.route('**/api/v1/deals/deal-privacy', (route) => json(route, deal))
    await page.route('**/api/v1/deals/deal-privacy/title-package', (route) => route.fulfill({ status: 404 }))

    await page.goto('/deals/deal-privacy')
    await expect(page.getByText(/deal pipeline/i).first()).toBeVisible()
    expectNoPrivateBuyerText(await bodyText(page))
  })

  test('buyer contract signing hides EMD while showing agreed total price', async ({ page }) => {
    await mockBuyerSession(page)
    await page.route('**/api/v1/listings/listing-privacy', (route) => json(route, listing))
    await page.route('**/api/v1/contracts/listing/listing-privacy', (route) => json(route, contract))
    await page.route('**/api/v1/bids/mine', (route) => json(route, [{
      _id: 'bid-privacy',
      id: 'bid-privacy',
      listingId: listing._id,
      assignmentPrice: 199999,
      emdAmount: 5000,
      status: 'primary',
    }]))

    await page.goto('/listings/listing-privacy/sign')
    await expect(page.getByRole('heading', { name: /purchase & assignment agreement/i })).toBeVisible()
    await expect(page.getByText('$199,999')).toBeVisible()
    expectNoPrivateBuyerText(await bodyText(page))
  })
})
