import { ArrowRight, Loader2, Mail, Shield } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { User, UserRole } from '@/types'

type AuthPayload = {
  accessToken: string
  user: User
}

type ApiSuccess<T> = {
  success: boolean
  data: T
  message?: string
}

function dashboardPath(role: UserRole): string {
  switch (role) {
    case 'wholesaler':
    case 'realtor':
      return '/wholesaler/dashboard'
    case 'buyer':
      return '/buyer/dashboard'
    case 'title_rep':
      return '/title/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/wholesaler/dashboard'
  }
}

function toastApiError(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const raw = err.response?.data as { message?: string | string[] } | undefined
    const m = raw?.message
    toast.error(Array.isArray(m) ? m.join(', ') : m ?? fallback)
    return
  }
  toast.error(fallback)
}

function resolveLoginEmail(
  stateEmail: string | undefined,
  queryEmail: string | null,
): string {
  const fromState = stateEmail?.trim()
  if (fromState) return fromState

  const fromQuery = queryEmail?.trim()
  if (fromQuery) return fromQuery

  try {
    return sessionStorage.getItem('tract_login_email')?.trim() ?? ''
  } catch {
    return ''
  }
}

export default function LoginVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const email = resolveLoginEmail(
    (location.state as { email?: string } | null)?.email,
    searchParams.get('email'),
  )

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(60)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
      return
    }
    try {
      sessionStorage.setItem('tract_login_email', email)
    } catch {
      /* ignore */
    }
  }, [email, navigate])

  useEffect(() => {
    if (resendSeconds <= 0) return
    const id = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
  }, [resendSeconds])

  const code = digits.join('')
  const resendDisabled = resendSeconds > 0 || resending || submitting

  const onDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const onResend = async () => {
    if (resendDisabled || !email) return
    setResending(true)
    try {
      await api.post('/auth/resend-login-otp', { email })
      setDigits(['', '', '', '', '', ''])
      setResendSeconds(60)
      inputsRef.current[0]?.focus()
      toast.success('A new code was sent to your email.')
    } catch (err) {
      toastApiError(err, 'Could not resend code. Try again.')
    } finally {
      setResending(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code.')
      return
    }
    setSubmitting(true)
    try {
      const { data: envelope } = await api.post<ApiSuccess<AuthPayload>>(
        '/auth/verify-login-otp',
        { email, otp: code },
      )
      const payload = envelope.data
      if (!payload?.accessToken || !payload?.user) {
        toast.error('Unexpected response from server.')
        return
      }
      useAuthStore.getState().setSession(payload.accessToken, payload.user)
      try {
        sessionStorage.removeItem('tract_login_email')
      } catch {
        /* ignore */
      }
      toast.success('Signed in successfully.')
      navigate(dashboardPath(payload.user.role), { replace: true })
    } catch (err) {
      toastApiError(err, 'Verification failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app1-bg-main px-4 font-poppins text-app1-text-main">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-app1-border-light bg-white p-8 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-app1-primary text-white">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-cinzel text-xl font-bold">Verify sign-in</h1>
            <p className="text-sm text-app1-text-muted">2FA code required</p>
          </div>
        </div>

        <p className="text-sm text-app1-text-muted">We sent a 6-digit code to</p>
        <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-app1-bg-soft px-3 py-2 text-sm">
          <Mail className="h-4 w-4 text-app1-text-muted" />
          <span className="truncate font-medium">{email}</span>
        </div>

        <div className="flex justify-between gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el
              }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => onDigitChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="h-12 w-11 rounded-lg border border-app1-border-light bg-app1-bg-soft text-center text-lg font-semibold outline-none focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30"
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={resendDisabled}
            onClick={onResend}
            aria-label={
              resendSeconds > 0 ? `Resend code in ${resendSeconds} seconds` : 'Resend verification code'
            }
            className="font-poppins text-sm text-app1-secondary underline transition-colors hover:opacity-80 disabled:pointer-events-none disabled:opacity-50"
          >
            {resending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending…
              </span>
            ) : (
              'Resend code'
            )}
          </button>
          {resendSeconds > 0 ? (
            <span className="font-poppins text-sm text-app1-text-muted" aria-live="polite">
              {resendSeconds}s
            </span>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting || code.length !== 6}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-app1-primary font-semibold text-white disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Verify & continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-app1-text-muted">
          Wrong account?{' '}
          <Link to="/login" className="font-medium text-app1-primary underline">
            Back to sign in
          </Link>
        </p>
      </form>
    </main>
  )
}
