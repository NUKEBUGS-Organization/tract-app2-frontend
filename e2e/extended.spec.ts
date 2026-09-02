import { test, expect } from '@playwright/test'
import { loginAsRealtor } from './helpers/auth'

test.describe('TRACT extended UI flows', () => {
  test('support — create ticket after login', async ({ page }) => {
    await loginAsRealtor(page)

    await page.goto('/support/new')
    await expect(page.getByRole('heading', { name: /open a ticket/i })).toBeVisible()

    await page.locator('select').selectOption('Technical Issue')
    await page.getByLabel(/^subject$/i).fill('Playwright QA ticket')
    await page
      .getByLabel(/^description$/i)
      .fill('Automated UI test verifying support ticket submission from the frontend with enough detail.')

    await page.getByRole('button', { name: /submit ticket/i }).click()
    await expect(page).toHaveURL(/\/support\//, { timeout: 15_000 })
    await expect(page.getByText(/Playwright QA ticket/i)).toBeVisible({ timeout: 10_000 })
  })

  test('wholesaler — listings page loads', async ({ page }) => {
    await loginAsRealtor(page)
    await page.goto('/wholesaler/listings')
    await expect(page).toHaveURL(/\/wholesaler\/listings/)
    await expect(page.getByText(/listing|contract|draft/i).first()).toBeVisible()
  })

  test('register legal pages accessible', async ({ page }) => {
    await page.goto('/legal/terms')
    await expect(page.getByText(/terms|agreement/i).first()).toBeVisible()
    await page.goto('/legal/privacy')
    await expect(page.getByText(/privacy/i).first()).toBeVisible()
  })
})
