import { test, expect } from '@playwright/test'

test.describe('TRACT UI smoke tests', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()
  })

  test('register page — role selection', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText(/buyer|wholesaler|realtor/i).first()).toBeVisible()
  })

  test('full login flow — realtor lands on wholesaler dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('textbox', { name: /email/i }).fill('qaiserwaheed00@gmail.com')
    await page.getByRole('textbox', { name: /password/i }).fill('Test1234!')
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click()

    await expect(page).toHaveURL(/\/login\/verify/, { timeout: 15_000 })

    const otp = '123456'
    const inputs = page.locator('input[inputmode="numeric"]')
    await expect(inputs).toHaveCount(6)
    for (let i = 0; i < 6; i++) {
      await inputs.nth(i).fill(otp[i]!)
    }

    await page.getByRole('button', { name: /verify & continue/i }).click()
    await expect(page).toHaveURL(/\/wholesaler\/dashboard/, { timeout: 20_000 })
  })

  test('unauthenticated user redirected from protected route', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})
