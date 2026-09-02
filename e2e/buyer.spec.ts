import { test, expect } from '@playwright/test'
import { apiRegisterBuyer } from './helpers/api-auth'
import { loginAsBuyer, expectNoCrashPage } from './helpers/auth'

const stamp = Date.now()

test.describe('TRACT buyer UI flows', () => {
  test.setTimeout(120_000)

  let buyerEmail: string
  let buyerPassword: string

  test.beforeAll(async () => {
    const creds = await apiRegisterBuyer(stamp)
    buyerEmail = creds.email
    buyerPassword = creds.password
  })

  test('buyer — login lands on dashboard', async ({ page }) => {
    await loginAsBuyer(page, buyerEmail, buyerPassword)
    await expect(page.getByText(/dashboard|marketplace|welcome/i).first()).toBeVisible()
    await expectNoCrashPage(page)
  })

  test('buyer — marketplace page loads', async ({ page }) => {
    await loginAsBuyer(page, buyerEmail, buyerPassword)
    await page.goto('/buyer/marketplace')
    await expect(page).toHaveURL(/\/buyer\/marketplace/)
    await expect(page.getByText(/listing|marketplace|property/i).first()).toBeVisible({ timeout: 15_000 })
    await expectNoCrashPage(page)
  })

  test('buyer — my bids page loads', async ({ page }) => {
    await loginAsBuyer(page, buyerEmail, buyerPassword)
    await page.goto('/buyer/bids')
    await expect(page).toHaveURL(/\/buyer\/bids/)
    await expectNoCrashPage(page)
  })

  test('buyer — cannot access admin', async ({ page }) => {
    await loginAsBuyer(page, buyerEmail, buyerPassword)
    await page.goto('/admin/dashboard')
    await expect(page).not.toHaveURL(/\/admin\/dashboard/)
    await expectNoCrashPage(page)
  })
})
