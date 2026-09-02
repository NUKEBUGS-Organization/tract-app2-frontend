import { test, expect, devices } from '@playwright/test'
import { apiRegisterBuyer, readLoginOtp } from './helpers/api-auth'
import { loginAsAdmin, loginAsRealtor, expectNoCrashPage } from './helpers/auth'
import Redis from 'ioredis'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../tract-app2-backend/.env') })

const stamp = Date.now()

async function readResetOtp(email: string) {
  const r = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')
  const code = await r.get(`otp:email:reset:${email.toLowerCase()}`)
  await r.quit().catch(() => undefined)
  if (!code) throw new Error(`reset OTP missing for ${email}`)
  return code
}

test.describe('TRACT UI gap coverage', () => {
  test.setTimeout(120_000)

  test('forgot-password — full reset flow', async ({ page }) => {
    const { email, password } = await apiRegisterBuyer(stamp + 5000)
    const newPassword = 'NewPass1!'

    await page.goto('/forgot-password')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByRole('button', { name: /send reset code/i }).click()
    await expect(page.getByText(/enter reset code/i)).toBeVisible({ timeout: 15_000 })

    const otp = await readResetOtp(email)
    await page.getByPlaceholder('000000').fill(otp)
    await page.getByPlaceholder('Min 8 chars').fill(newPassword)
    await page.getByPlaceholder('Repeat new password').fill(newPassword)
    await page.getByRole('button', { name: /reset password/i }).click()
    await expect(page.getByText(/password reset!/i)).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: /sign in now/i }).click()
    await expect(page).toHaveURL(/\/login/)
    await page.getByRole('textbox', { name: /email/i }).fill(email)
    await page.getByRole('textbox', { name: /password/i }).fill(newPassword)
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click()
    await expect(page).toHaveURL(/\/login\/verify/, { timeout: 30_000 })
    const loginOtp = await readLoginOtp(email)
    const inputs = page.locator('input[inputmode="numeric"]')
    for (let i = 0; i < 6; i++) await inputs.nth(i).fill(loginOtp[i]!)
    await page.getByRole('button', { name: /verify & continue/i }).click()
    await expect(page).toHaveURL(/\/buyer\/dashboard/, { timeout: 30_000 })
    await expectNoCrashPage(page)
  })

  test('login page — Google sign-in button present', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /google/i })).toBeVisible()
    await expectNoCrashPage(page)
  })

  test('admin — penalties page loads', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/penalties')
    await expect(page).toHaveURL(/\/admin\/penalties/)
    await expect(page.getByText(/penalt|violation|score/i).first()).toBeVisible({ timeout: 15_000 })
    await expectNoCrashPage(page)
  })

  test('wholesaler — notifications panel in settings', async ({ page }) => {
    await loginAsRealtor(page)
    await page.goto('/wholesaler/settings')
    await expect(page).toHaveURL(/\/wholesaler\/settings/)
    await expect(page.getByText(/notification/i).first()).toBeVisible({ timeout: 15_000 })
    await expectNoCrashPage(page)
  })
})

test('login page renders on mobile viewport', async ({ browser }) => {
  const context = await browser.newContext({ ...devices['iPhone 13'] })
  const page = await context.newPage()
  await page.goto('/login')
  await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  const body = await page.locator('body').innerText()
  expect(body.toLowerCase()).not.toMatch(/something went wrong|unhandled|internal server error/)
  await context.close()
})
