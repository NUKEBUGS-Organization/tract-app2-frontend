import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import BackButton from '@/components/auth/BackButton'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import PasswordStrength from '@/components/auth/PasswordStrength'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { step2Schema, type Step2FormData } from '@/lib/validators/auth'
import { APP2_STATES } from '@/lib/constants/states'
import { useRegisterStore } from '@/store/registerStore'

export default function DetailsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const {
    setStep2Data,
    setTermsAccepted,
    fullName,
    email,
    phone,
    stateCode,
    dob,
    password,
    termsAccepted,
  } = useRegisterStore()

  const sendOtpMutation = useMutation({
    mutationFn: async (payload: { phone: string; email: string }) => {
      await api.post('/auth/send-otp', payload)
    },
    onSuccess: () => {
      navigate('/register/verify')
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const raw = error.response?.data as { message?: string | string[] } | undefined
        const m = raw?.message
        const msg = Array.isArray(m)
          ? m.join(', ')
          : m ?? 'Could not send verification codes. Try again.'
        toast.error(String(msg))
      } else {
        toast.error('Could not send verification codes. Try again.')
      }
    },
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      fullName: fullName || '',
      email: email || '',
      phone: phone.replace(/^\+1/, '') || '',
      stateCode: stateCode || '',
      dob: dob || '',
      password: password || '',
      confirmPassword: password || '',
      terms: termsAccepted || false,
    },
  })

  useEffect(() => {
    const subscription = watch((values) => {
      if (values.fullName || values.email) {
        setStep2Data({
          fullName: values.fullName ?? '',
          email: values.email ?? '',
          phone: values.phone ? '+1' + String(values.phone).replace(/\D/g, '') : '',
          stateCode: values.stateCode ?? '',
          dob: values.dob ?? '',
          password: values.password ?? '',
        })
      }
      if (values.terms !== undefined) {
        setTermsAccepted(!!values.terms)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setStep2Data, setTermsAccepted])

  const passwordValue = watch('password', '')

  const onSubmit = (data: Step2FormData) => {
    setStep2Data({
      fullName: data.fullName,
      email: data.email,
      phone: '+1' + data.phone.replace(/\D/g, ''),
      stateCode: data.stateCode,
      dob: data.dob,
      password: data.password,
    })
    setTermsAccepted(data.terms)
    sendOtpMutation.mutate({
      phone: '+1' + data.phone.replace(/\D/g, ''),
      email: data.email.trim(),
    })
  }

  const inputBase =
    'h-12 rounded-lg border px-4 font-poppins text-[14px] text-app1-text-main outline-none transition-colors placeholder:text-app1-text-muted'
  const inputNormal = `${inputBase} border-app1-border-light bg-app1-bg-soft focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30`
  const inputInvalid = `${inputBase} border-app1-danger focus:border-app1-danger focus:ring-2 focus:ring-app1-danger/30`

  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins">
      <OnboardingHeader currentStep={2} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-[3px] bg-app1-border-light">
        <div className="h-full w-1/2 bg-app1-primary transition-all duration-500" />
      </div>

      <main className="grow pb-10 pl-4 pr-4 pt-[152px] md:px-0">
        <div className="mx-auto max-w-[680px]">
          <BackButton to="/register" label="Back" />

          <div className="mb-6">
            <h1 className="mb-1 font-cinzel text-[36px] font-black leading-tight text-app1-primary">
              Tell us about yourself.
            </h1>
            <p className="font-poppins text-[16px] text-app1-text-muted">
              This information is used for identity verification and platform access.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card md:p-10">
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    Full Name
                  </label>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Johnathan Doe"
                    aria-invalid={!!errors.fullName}
                    className={cn(errors.fullName ? inputInvalid : inputNormal)}
                  />
                  {errors.fullName ? (
                    <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                      {errors.fullName.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    Date of Birth
                  </label>
                  <input
                    {...register('dob')}
                    type="date"
                    aria-invalid={!!errors.dob}
                    className={cn(errors.dob ? inputInvalid : inputNormal)}
                  />
                  {errors.dob ? (
                    <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                      {errors.dob.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="j.doe@marketplace.com"
                      aria-invalid={!!errors.email}
                      className={cn(errors.email ? inputInvalid : inputNormal)}
                    />
                    {errors.email ? (
                      <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                        {errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none font-poppins text-[14px] text-app1-text-muted">
                        +1
                      </span>
                      <input
                        {...register('phone', {
                          setValueAs: (v) => (typeof v === 'string' ? v.replace(/\D/g, '') : ''),
                        })}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="(555) 000-0000"
                        aria-invalid={!!errors.phone}
                        className={cn(
                          'h-12 w-full rounded-lg border pl-[44px] pr-4',
                          errors.phone ? inputInvalid : inputNormal,
                        )}
                      />
                    </div>
                    {errors.phone ? (
                      <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                        {errors.phone.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    Home State
                  </label>
                  <div className="relative">
                    <select
                      {...register('stateCode')}
                      aria-invalid={!!errors.stateCode}
                      className={cn(
                        'h-12 w-full cursor-pointer appearance-none rounded-lg border px-4 bg-app1-bg-soft',
                        errors.stateCode ? inputInvalid : inputNormal,
                      )}
                    >
                      <option value="">Select a state</option>
                      {APP2_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-app1-text-muted"
                      aria-hidden
                    />
                  </div>
                  {errors.stateCode ? (
                    <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                      {errors.stateCode.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={!!errors.password}
                        className={cn('h-12 w-full rounded-lg border px-4 pr-12', errors.password ? inputInvalid : inputNormal)}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-app1-text-muted transition-colors hover:text-app1-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app1-secondary/30"
                      >
                        {showPassword ? (
                          <EyeOff size={16} aria-hidden />
                        ) : (
                          <Eye size={16} aria-hidden />
                        )}
                      </button>
                    </div>
                    <PasswordStrength password={passwordValue} />
                    {errors.password ? (
                      <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        aria-invalid={!!errors.confirmPassword}
                        className={cn('h-12 w-full rounded-lg border px-4 pr-12', errors.confirmPassword ? inputInvalid : inputNormal)}
                      />
                      <button
                        type="button"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-app1-text-muted transition-colors hover:text-app1-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app1-secondary/30"
                      >
                        {showConfirm ? (
                          <EyeOff size={16} aria-hidden />
                        ) : (
                          <Eye size={16} aria-hidden />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword ? (
                      <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                        {errors.confirmPassword.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4">
                  <Controller
                    name="terms"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="terms"
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-invalid={!!errors.terms}
                        className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-app1-border-light text-app1-secondary focus:ring-0 focus:ring-offset-0"
                      />
                    )}
                  />
                  <label htmlFor="terms" className="cursor-pointer font-poppins text-[14px] leading-[1.5] text-app1-text-muted">
                    I agree to TRACT&apos;s{' '}
                    <a
                      href="/legal/terms"
                      target="_blank"
                      className="font-bold text-app1-primary underline transition-colors hover:text-app1-primary/80"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/legal/privacy"
                      target="_blank"
                      className="font-bold text-app1-primary underline transition-colors hover:text-app1-primary/80"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                {errors.terms ? (
                  <p role="alert" className="-mt-4 font-poppins text-[12px] text-app1-danger">
                    {errors.terms.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-10 flex w-full">
              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="flex h-14 w-full items-center justify-center gap-2 bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {sendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                    Sending codes...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 overflow-hidden rounded-[12px]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD640tPMzlhOlui8iyiAOvkUHDafMy03SmxAV9_MNOVpPWh-8-VtWu2LE9AX-8iH9mlhgnRUh4Z8pfSmPZw_XQIJNEMDWT5aPfkWZ6oXFOo4n5kbbyCVS1gKqwlwSKMOwTeogywVtgWSt_Pim5O7XI36FGbEp_KKrkJNmLGBnSVrfWKKRwfTgJCmsGfHqahdtz_lVQDy_QOG0jf0Pve-5QRv85nbbS9l0HBwSa7qr8VaB_LS5WY5Nc2CBsNI-VmRdn-XiNeIesLVlE"
              alt="Premium office interior with dark marble and gold accents"
              className="h-[240px] w-full object-cover opacity-90"
            />
          </div>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
