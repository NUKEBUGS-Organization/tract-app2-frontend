import { test, expect } from '@playwright/test'
import { loginAsAdmin, expectNoCrashPage } from './helpers/auth'

test.describe('TRACT admin UI flows', () => {
  test.setTimeout(120_000)

  test('admin — login lands on control center', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page.getByText(/pending review|active deals|admin|dashboard/i).first()).toBeVisible({
      timeout: 20_000,
    })
    await expectNoCrashPage(page)
  })

  test('admin — pending listings page', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/listings')
    await expect(page).toHaveURL(/\/admin\/listings/)
    await expect(page.getByText(/listing|pending|review/i).first()).toBeVisible({ timeout: 15_000 })
    await expectNoCrashPage(page)
  })

  test('admin — user management page', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.getByText(/user|email|role/i).first()).toBeVisible({ timeout: 15_000 })
    await expectNoCrashPage(page)
  })

  test('admin — chat surveillance page', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/chat')
    await expect(page).toHaveURL(/\/admin\/chat/)
    await expectNoCrashPage(page)
  })

  test('admin — cannot access wholesaler workspace as home', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/wholesaler/dashboard')
    // Admin may be redirected or see forbidden — should not white-screen
    await expectNoCrashPage(page)
  })
})
