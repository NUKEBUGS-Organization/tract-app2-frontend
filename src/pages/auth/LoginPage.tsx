import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import api from '@/lib/api'
import { loginSchema, type LoginFormData } from '@/lib/validators/auth'
import { useAuthStore } from '@/store/authStore'
import type { User, UserRole } from '@/types'
import { cn } from '@/lib/utils'

const HERO_TEXTURE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbl9ezjXJTVFVvoMIRuHtMGZN79JVY_Djq_2CU2B0zDqrQefsepCIaZjQHVjt_je5t1Jwhj8pjuEhYIYJHFcvuXly7fn8rSBb5JsNsNuXL6LdxO-XhJgbRaYLTwKGp--paiyOTwNfcrXmckJVcY61d--vN9sTGuWVS94E1DmwX5qn9guedpIpP0FO1E2KcBBreeT2nRGJknjDSkIXqedm3NOF0O9YgOH_zpnjVAsh0cJNNnKiV3_MD-ELdByAxWczT104imyXhwuc'

function dashboardPath(role: UserRole): string {
  switch (role) {
    case 'wholesaler':
      return '/wholesaler/dashboard'
    case 'buyer':
    case 'realtor':
      return '/buyer/dashboard'
    case 'seller':
      return '/wholesaler/dashboard'
    case 'title_rep':
      return '/title/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/buyer/dashboard'
  }
}

type LoginPayload = {
  accessToken: string
  user: User
}

type ApiSuccess<T> = {
  success: boolean
  data: T
  message?: string
}

export default function LoginPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormData) => {
    setSubmitting(true)
    try {
      const { data: envelope } = await api.post<ApiSuccess<LoginPayload>>('/auth/login', {
        email: values.email.trim(),
        password: values.password,
      })

      const payload = envelope.data
      if (payload?.accessToken && payload?.user) {
        useAuthStore.getState().setSession(payload.accessToken, payload.user)
        toast.success('Signed in successfully.')
        navigate(dashboardPath(payload.user.role), { replace: true })
        return
      }

      toast.message(envelope.message ?? 'Unexpected sign-in response.')
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const raw = e.response?.data as { message?: string | string[] } | undefined
        const m = raw?.message
        const msg = Array.isArray(m) ? m.join(', ') : m ?? e.response?.statusText ?? 'Sign in failed. Try again.'
        toast.error(msg)
      } else {
        toast.error('Something went wrong.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'h-12 w-full rounded-lg border border-[#2C2C2E]/30 bg-white px-4 font-inter text-base text-tract-obsidian placeholder:text-gray-400 transition-all duration-200 focus:border-tract-gold focus:outline-none focus:ring-1 focus:ring-tract-gold'

  return (
    <main className="flex min-h-screen overflow-hidden bg-tract-obsidian font-inter text-gray-200 selection:bg-tract-gold/30 selection:text-tract-obsidian">
      {/* Left marketing panel */}
      <section className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-tract-obsidian p-10 md:flex lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <img src={HERO_TEXTURE} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative z-10">
          <span className="font-playfair text-[28px] font-bold text-white">TRACT</span>
        </div>
        <div className="relative z-10 max-w-lg space-y-8">
          <h1 className="font-playfair text-4xl font-bold leading-tight text-white lg:text-[48px]">
            Private real estate.
            <br />
            <span className="text-tract-gold">Controlled deal flow.</span>
          </h1>
          <p className="max-w-md font-inter text-base text-gray-400">
            A verified marketplace for wholesalers, end buyers, and licensed realtors. Every deal — protected.
          </p>
          <ul className="space-y-4 pt-4">
            {['KYC-verified identities only', 'Anti-circumvention chat enforcement', 'Automated kill switch protection'].map(
              (line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tract-green">
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
                  </span>
                  <span className="font-inter text-sm text-gray-400">{line}</span>
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Shield className="h-4 w-4 text-tract-gold" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-xs text-gray-500">256-bit encrypted · Bank-grade security</span>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex w-full min-h-screen flex-col bg-tract-alabaster md:w-[55%]">
        <div className="flex justify-start p-4 md:hidden">
          <span className="font-playfair text-[28px] font-bold text-tract-green">TRACT</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-8 pt-4 md:px-12">
          <div className="w-full max-w-[400px] space-y-10">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="font-playfair text-4xl font-bold text-tract-obsidian">Welcome back.</h2>
              <p className="font-inter text-base text-gray-500">Sign in to your TRACT account</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-2">
                <label htmlFor="login-email" className="block font-inter text-xs font-bold uppercase tracking-wide text-gray-500">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputClass}
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email ? <p className="font-inter text-sm text-tract-red">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="login-password" className="font-inter text-xs font-bold uppercase tracking-wide text-gray-500">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="shrink-0 font-inter text-sm font-semibold text-tract-gold transition-opacity hover:opacity-80"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={cn(inputClass, 'pr-12')}
                    aria-invalid={!!errors.password}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500 transition-colors hover:text-tract-gold"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
                  </button>
                </div>
                {errors.password ? <p className="font-inter text-sm text-tract-red">{errors.password.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-14 w-full items-center justify-center gap-2 bg-tract-gold font-inter text-sm font-semibold uppercase tracking-[0.15em] text-white shadow-sm transition-transform hover:opacity-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 py-1">
                <div className="h-px flex-1 bg-[#2C2C2E]/10" />
                <span className="font-inter text-sm text-gray-400">or</span>
                <div className="h-px flex-1 bg-[#2C2C2E]/10" />
              </div>

              <p className="text-center font-inter text-base text-gray-500 md:text-left">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-tract-green hover:underline">
                  Get started free →
                </Link>
              </p>
            </form>

            <p className="text-center font-inter text-xs leading-relaxed text-gray-400 md:text-left">
              By signing in you agree to TRACT&apos;s{' '}
              <button type="button" className="underline hover:text-tract-gold" onClick={() => toast.message('Terms of Service (preview).')}>
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="underline hover:text-tract-gold" onClick={() => toast.message('Privacy Policy (preview).')}>
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>

        <footer className="mt-auto border-t border-transparent bg-tract-graphite p-6 md:hidden">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6">
              {(['Support', 'Compliance', 'Regulatory'] as const).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toast.message(`${label} — coming soon.`)}
                  className="font-inter text-xs text-gray-400 transition-colors hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="font-inter text-[10px] text-gray-500">© 2026 TRACT Institutional Suite. All rights reserved.</span>
          </div>
        </footer>
      </section>
    </main>
  )
}
