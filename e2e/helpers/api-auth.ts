import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import Redis from 'ioredis'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../tract-app2-backend/.env') })

const API = (process.env.QA_API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3001/api/v1').replace(
  /\/$/,
  '',
)
const TEST_OTP = process.env.TEST_OTP_CODE ?? '123456'
const TEST_EMAILS = (process.env.TEST_EMAILS ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

function redis() {
  return new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')
}

async function readOtp(key: string) {
  const r = redis()
  const code = await r.get(key)
  await r.quit().catch(() => undefined)
  if (!code) throw new Error(`OTP missing: ${key}`)
  return code
}

export async function readLoginOtp(email: string) {
  const normalized = email.toLowerCase().trim()
  if (TEST_EMAILS.includes(normalized)) return TEST_OTP

  const r = redis()
  for (let i = 0; i < 10; i++) {
    const code = await r.get(`otp:email:login:${normalized}`)
    if (code) {
      await r.quit().catch(() => undefined)
      return code
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  await r.quit().catch(() => undefined)
  return TEST_OTP
}

export async function apiRegisterBuyer(stamp: number) {
  const email = `pw_buyer_${stamp}@test.com`
  const phone = `+1${String(stamp).slice(-10).padStart(10, '0')}`
  const password = 'Password1'

  let res = await fetch(`${API}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error(`send-otp ${res.status}`)

  const otp = await readOtp(`otp:email:${email.toLowerCase()}`)
  res = await fetch(`${API}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, emailOtp: otp }),
  })
  if (!res.ok) throw new Error(`verify-otp ${res.status}`)

  res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'PW Buyer',
      email,
      phone,
      password,
      role: 'buyer',
      dob: '1990-01-01',
      stateCode: 'TX',
    }),
  })
  if (res.status !== 201) throw new Error(`register ${res.status}`)

  return { email, password }
}

export async function apiLoginOtp(email: string, password: string, useBypass = false) {
  let res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(`login ${res.status}`)

  const normalized = email.toLowerCase().trim()
  const otp = useBypass ? TEST_OTP : await readOtp(`otp:email:login:${normalized}`)

  res = await fetch(`${API}/auth/verify-login-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalized, otp }),
  })
  if (!res.ok) throw new Error(`verify-login-otp ${res.status}`)
}

export const ADMIN_EMAIL = 'wasifzahoor296@gmail.com'
export const ADMIN_PASSWORD = 'admin1234!'
export const REALTOR_EMAIL = 'qaiserwaheed00@gmail.com'
export const REALTOR_PASSWORD = 'Test1234!'
