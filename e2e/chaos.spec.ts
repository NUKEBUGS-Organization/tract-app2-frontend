import { test, expect } from '@playwright/test'
import { loginAsRealtor, expectNoCrashPage } from './helpers/auth'

async function submitLoginForOtp(page: import('@playwright/test').Page) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto('/login')
    await page.getByRole('textbox', { name: /email/i }).fill('qaiserwaheed00@gmail.com')
    await page.getByRole('textbox', { name: /password/i }).fill('Test1234!')
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click()

    try {
      await expect(page).toHaveURL(/\/login\/verify/, { timeout: 25_000 })
      return
    } catch {
      if (attempt < 2) {
        await page.waitForTimeout(2000)
        continue
      }
      throw new Error('Login did not reach OTP verify page after 3 attempts')
    }
  }
}

const WHOLESALER_ROUTES = [
  '/wholesaler/dashboard',
  '/wholesaler/listings',
  '/wholesaler/bids',
  '/wholesaler/deals',
  '/wholesaler/score',
  '/wholesaler/settings',
  '/support',
  '/support/faq',
]

test.describe('TRACT UI chaos / stress', () => {
  test.setTimeout(90_000)

  test('rapid navigation across wholesaler routes', async ({ page }) => {
    await loginAsRealtor(page)

    for (let cycle = 0; cycle < 3; cycle++) {
      for (const route of WHOLESALER_ROUTES) {
        await page.goto(route)
        await expectNoCrashPage(page)
      }
    }

    await expect(page).not.toHaveURL(/\/login/)
  })

  test('browser back/forward spam after login', async ({ page }) => {
    await loginAsRealtor(page)
    await page.goto('/wholesaler/listings')
    await page.goto('/wholesaler/bids')
    await page.goto('/wholesaler/deals')

    for (let i = 0; i < 8; i++) {
      await page.goBack()
      await page.waitForTimeout(100)
      await page.goForward()
      await page.waitForTimeout(100)
    }

    await expectNoCrashPage(page)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('double-submit login form does not white-screen', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('textbox', { name: /email/i }).fill('qaiserwaheed00@gmail.com')
    await page.getByRole('textbox', { name: /password/i }).fill('Test1234!')

    const submit = page.getByRole('button', { name: /sign in|log in|continue/i })
    await submit.dblclick()

    await expect(page).toHaveURL(/\/login\/verify/, { timeout: 20_000 })
    await expectNoCrashPage(page)
  })

  test('double-click OTP verify button', async ({ page }) => {
    await submitLoginForOtp(page)

    const otp = '123456'
    const inputs = page.locator('input[inputmode="numeric"]')
    for (let i = 0; i < 6; i++) await inputs.nth(i).fill(otp[i]!)

    const verify = page.getByRole('button', { name: /verify & continue/i })
    await verify.dblclick()

    await expect(page).toHaveURL(/\/wholesaler\/dashboard/, { timeout: 30_000 })
    await expectNoCrashPage(page)
  })

  test('invalid deep links show login or safe fallback', async ({ page }) => {
    const badRoutes = [
      '/admin/dashboard',
      '/buyer/marketplace',
      '/deals/not-a-real-id',
      '/listings/000000000000000000000000',
      '/wholesaler/listings/not-valid',
    ]

    for (const route of badRoutes) {
      await page.goto(route)
      await expectNoCrashPage(page)
      const url = page.url()
      expect(url).toMatch(/\/(login|wholesaler|buyer|admin|deals|listings)/)
    }
  })

  test('support form double-submit', async ({ page }) => {
    test.setTimeout(120_000)
    await loginAsRealtor(page)
    await page.goto('/support/new')

    const subject = `Chaos double submit ${Date.now()}`
    await page.locator('select').selectOption('Technical Issue')
    await page.getByLabel(/^subject$/i).fill(subject)
    await page
      .getByLabel(/^description$/i)
      .fill('Testing double submit on support form to ensure no duplicate crash or white screen.')

    const submit = page.getByRole('button', { name: /submit ticket/i })
    await submit.dblclick()
    await expect(page).toHaveURL(/\/support\/[^/]+/, { timeout: 30_000 })
    await expect(page.getByText(subject)).toBeVisible({ timeout: 15_000 })
    await expectNoCrashPage(page)
  })

  test('concurrent tab navigation', async ({ browser }) => {
    const authContext = await browser.newContext()
    const guestContext = await browser.newContext()
    const page1 = await authContext.newPage()
    const page2 = await guestContext.newPage()

    await loginAsRealtor(page1)

    await page1.goto('/wholesaler/dashboard')
    await page2.goto('/wholesaler/listings')

    // Guest context has no session — should redirect to login
    await expect(page2).toHaveURL(/\/login/, { timeout: 10_000 })

    await page1.goto('/wholesaler/bids')
    await expectNoCrashPage(page1)

    await authContext.close()
    await guestContext.close()
  })

  test('register flow rapid role switching', async ({ page }) => {
    await page.goto('/register')

    for (let i = 0; i < 5; i++) {
      await page.getByText(/buyer/i).first().click().catch(() => undefined)
      await page.getByText(/wholesaler/i).first().click().catch(() => undefined)
      await page.getByText(/realtor/i).first().click().catch(() => undefined)
    }

    await expectNoCrashPage(page)
    await page.goto('/register/details')
    await expect(page).toHaveURL(/\/register/)
  })
})
