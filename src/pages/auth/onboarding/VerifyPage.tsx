import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import BackButton from '@/components/auth/BackButton'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import OtpSixInput from '@/components/auth/OtpSixInput'
import api from '@/lib/api'
import { verifyOtpSchema, type VerifyOtpFormData } from '@/lib/validators/auth'
import { useAuthStore } from '@/store/authStore'
import { useRegisterStore } from '@/store/registerStore'
import type { User, UserRole } from '@/types'

function toastApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const raw = error.response?.data as { message?: string | string[] } | undefined
    const m = raw?.message
    const msg = Array.isArray(m) ? m.join(', ') : m ?? fallback
    toast.error(String(msg))
    return
  }
  toast.error(fallback)
}

export default function VerifyPage() {
  const navigate = useNavigate()
  const store = useRegisterStore()
  const { email, phone } = store
  const [resendSeconds, setResendSeconds] = useState(60)

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { smsCode: '', emailCode: '' },
  })

  useEffect(() => {
    if (resendSeconds <= 0) return
    const id = window.setInterval(() => {
      setResendSeconds((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [resendSeconds])

  useEffect(() => {
    if (!email || !phone) {
      navigate('/register/details')
    }
  }, [email, phone, navigate])

  const resendMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/send-otp', {
        phone: phone.startsWith('+') ? phone : '+1' + phone.replace(/\D/g, ''),
        email: email.trim(),
      })
    },
    onSuccess: () => {
      setResendSeconds(60)
      clearErrors()
      toast.success('New codes sent to your phone and email.')
    },
    onError: (err: unknown) => {
      toastApiError(err, 'Could not resend codes. Try again.')
    },
  })

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyOtpFormData) => {
      await api.post('/auth/verify-otp', {
        phone: phone.startsWith('+') ? phone : '+1' + phone.replace(/\D/g, ''),
        email: email.trim(),
        smsOtp: data.smsCode,
        emailOtp: data.emailCode,
      })

      const s = useRegisterStore.getState()
      if (!s.role || !s.fullName || !s.password || !s.stateCode || !s.dob) {
        throw new Error('Missing registration details. Please go back and complete the form.')
      }

      const { data: envelope } = await api.post<{
        success: boolean
        data: { accessToken: string; user: User }
      }>('/auth/register', {
        fullName: s.fullName.trim(),
        email: s.email.trim(),
        phone: s.phone.startsWith('+') ? s.phone : '+1' + s.phone.replace(/\D/g, ''),
        password: s.password,
        role: s.role as UserRole,
        dob: s.dob,
        stateCode: s.stateCode.toUpperCase(),
      })

      return envelope.data
    },
    onSuccess: (payload) => {
      clearErrors()
      useAuthStore.getState().setSession(payload.accessToken, payload.user)
      navigate('/register/kyc')
    },
    onError: (err: unknown) => {
      if (err instanceof Error && !axios.isAxiosError(err)) {
        setError('emailCode', { type: 'server', message: err.message })
        return
      }
      if (axios.isAxiosError(err)) {
        const raw = err.response?.data as { message?: string | string[] } | undefined
        const m = raw?.message
        const msg = Array.isArray(m) ? m.join(', ') : m ?? 'Verification failed. Check your codes.'
        setError('emailCode', { type: 'server', message: String(msg) })
        return
      }
      setError('emailCode', {
        type: 'server',
        message: 'Something went wrong. Please try again.',
      })
    },
  })

  const onSubmit = (data: VerifyOtpFormData) => {
    clearErrors()
    verifyMutation.mutate(data)
  }

  const resendDisabled =
    resendSeconds > 0 || resendMutation.isPending || verifyMutation.isPending

  const isPending = verifyMutation.isPending

  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins text-app1-text-main">
      <OnboardingHeader currentStep={3} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-app1-border-light">
        <div className="h-full w-3/4 bg-app1-primary transition-all duration-500" />
      </div>

      <main className="flex grow items-center justify-center px-4 py-10 md:px-12">
        <div className="flex w-full max-w-[480px] flex-col items-stretch rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card md:p-12">
          <BackButton to="/register/details" label="Back" className="self-start" />

          <div className="mb-6 flex h-12 w-12 items-center justify-center self-center rounded-full bg-app1-primary/10">
            <Shield className="h-6 w-6 text-app1-primary" strokeWidth={1.5} aria-hidden />
          </div>

          <h2 className="mb-4 text-center font-cinzel text-[32px] font-black text-app1-primary">
            Secure Your Account
          </h2>
          <p className="mb-10 text-center font-poppins text-[16px] text-app1-text-muted">
            We sent 6-digit codes to your phone and email. Enter both to continue.
          </p>

          <form className="w-full space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <label className="block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                SMS Code
                {phone ? (
                  <span className="ml-2 text-[11px] font-normal normal-case text-app1-text-muted">sent to {phone}</span>
                ) : null}
              </label>
              <Controller
                name="smsCode"
                control={control}
                render={({ field }) => (
                  <OtpSixInput
                    ref={field.ref}
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v)
                      clearErrors('smsCode')
                    }}
                    onBlur={field.onBlur}
                    error={!!errors.smsCode}
                    disabled={isPending}
                    groupLabel="SMS verification code"
                  />
                )}
              />
              {errors.smsCode ? (
                <p role="alert" className="mt-1 font-poppins text-[12px] text-app1-danger">
                  {errors.smsCode.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                Email Code
                {email ? (
                  <span className="ml-2 text-[11px] font-normal normal-case text-app1-text-muted">sent to {email}</span>
                ) : null}
              </label>
              <Controller
                name="emailCode"
                control={control}
                render={({ field }) => (
                  <OtpSixInput
                    ref={field.ref}
                    value={field.value}
                    onChange={(v) => {
                      field.onChange(v)
                      clearErrors('emailCode')
                    }}
                    onBlur={field.onBlur}
                    error={!!errors.emailCode}
                    disabled={isPending}
                    groupLabel="Email verification code"
                  />
                )}
              />
              {errors.emailCode ? (
                <p role="alert" className="mt-1 font-poppins text-[12px] text-app1-danger">
                  {errors.emailCode.message}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between py-1">
              <button
                type="button"
                disabled={resendDisabled}
                onClick={() => resendMutation.mutate()}
                aria-label={
                  resendSeconds > 0 ? `Resend codes in ${resendSeconds} seconds` : 'Resend verification codes'
                }
                className="font-poppins text-[14px] text-app1-secondary underline transition-colors hover:opacity-80 disabled:pointer-events-none disabled:opacity-50"
              >
                {resendMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Sending…
                  </span>
                ) : (
                  'Resend Codes'
                )}
              </button>
              {resendSeconds > 0 ? (
                <span className="font-poppins text-[14px] text-app1-text-muted" aria-live="polite">
                  {resendSeconds}s
                </span>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="flex h-14 w-full items-center justify-center rounded-lg bg-app1-primary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                  Verifying…
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <p className="text-center font-poppins text-[12px] text-app1-text-muted">
              Both codes are required. This protects your account.
            </p>
          </form>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
