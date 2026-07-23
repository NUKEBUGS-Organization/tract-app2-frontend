import { ArrowRight, Loader2, Mail, Shield } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

export default function LoginVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = (location.state as { email?: string } | null)?.email ?? ''

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
    }
  }, [email, navigate])

  const code = digits.join('')

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
      toast.success('Signed in successfully.')
      navigate(dashboardPath(payload.user.role), { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const raw = err.response?.data as { message?: string | string[] } | undefined
        const m = raw?.message
        toast.error(Array.isArray(m) ? m.join(', ') : m ?? 'Verification failed.')
      } else {
        toast.error('Something went wrong.')
      }
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

        <p className="text-sm text-app1-text-muted">
          We sent a 6-digit code to
        </p>
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
