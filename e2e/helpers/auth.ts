import { expect, type Page } from '@playwright/test'
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  REALTOR_EMAIL,
  REALTOR_PASSWORD,
  apiLoginOtp,
  readLoginOtp,
} from './api-auth'

const TEST_OTP = '123456'

async function submitLoginStep(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByRole('textbox', { name: /email/i }).fill(email)
  await page.getByRole('textbox', { name: /password/i }).fill(password)
  await page.getByRole('button', { name: /sign in|log in|continue/i }).click()
}

async function fillOtp(page: Page, otp = TEST_OTP) {
  const inputs = page.locator('input[inputmode="numeric"]')
  await expect(inputs.first()).toBeVisible({ timeout: 15_000 })
  for (let i = 0; i < 6; i++) await inputs.nth(i).fill(otp[i]!)
}

async function loginWithOtp(page: Page, email: string, password: string, dashboardPattern: RegExp) {
  for (let attempt = 0; attempt < 5; attempt++) {
    await submitLoginStep(page, email, password)

    try {
      await expect(page).toHaveURL(/\/login\/verify/, { timeout: 30_000 })
    } catch {
      if (attempt < 4) {
        await page.waitForTimeout(3000)
        continue
      }
      throw new Error('Login did not reach OTP verify page')
    }

    const otp = await readLoginOtp(email)
    await fillOtp(page, otp)
    await page.getByRole('button', { name: /verify & continue/i }).click()

    try {
      await expect(page).toHaveURL(dashboardPattern, { timeout: 30_000 })
      return
    } catch {
      if (attempt < 4) {
        await page.waitForTimeout(3000)
        continue
      }
      throw new Error(`OTP verify did not reach ${dashboardPattern}`)
    }
  }
}

/** Login with retry — resilient when API is under stress from parallel QA. */
export async function loginAsRealtor(page: Page) {
  await loginWithOtp(page, REALTOR_EMAIL, REALTOR_PASSWORD, /\/wholesaler\/dashboard/)
}

export async function loginAsAdmin(page: Page) {
  await loginWithOtp(page, ADMIN_EMAIL, ADMIN_PASSWORD, /\/admin\/dashboard/)
}

export async function loginAsBuyer(page: Page, email: string, password: string) {
  await loginWithOtp(page, email, password, /\/buyer\/dashboard/)
}

/** Warm API session via OTP (optional pre-step before UI login). */
export async function warmApiLogin(email: string, password: string, useBypass = false) {
  await apiLoginOtp(email, password, useBypass)
}

export async function expectNoCrashPage(page: Page) {
  const body = await page.locator('body').innerText()
  expect(body.toLowerCase()).not.toMatch(/something went wrong|unhandled|internal server error/)
  await expect(page.locator('body')).toBeVisible()
}
