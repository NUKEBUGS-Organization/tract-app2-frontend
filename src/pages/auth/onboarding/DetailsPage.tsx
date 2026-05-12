import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import PasswordStrength from '@/components/auth/PasswordStrength'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { step2Schema, type Step2FormData, US_STATES } from '@/lib/validators/auth'
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

  return (
    <div className="flex min-h-screen flex-col bg-tract-alabaster font-inter">
      <OnboardingHeader currentStep={2} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-[3px] bg-gray-200">
        <div className="h-full w-1/2 bg-tract-green transition-all duration-500" />
      </div>

      <main className="grow pb-10 pl-4 pr-4 pt-[152px] md:px-0">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-6">
            <h1 className="mb-1 font-playfair text-[36px] font-bold leading-tight text-tract-obsidian">
              Tell us about yourself.
            </h1>
            <p className="font-inter text-[16px] text-gray-500">
              This information is used for identity verification and platform access.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-[12px] bg-white p-10 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)]">
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[13px] font-bold uppercase tracking-[0.05em] text-gray-500">
                    Full Name
                  </label>
                  <input
                    {...register('fullName')}
                    type="text"
                    placeholder="Johnathan Doe"
                    aria-invalid={!!errors.fullName}
                    className={cn(
                      'h-[48px] rounded-lg border px-4 font-inter text-[16px] text-tract-obsidian outline-none',
                      'transition-colors duration-200 placeholder:text-gray-300',
                      errors.fullName
                        ? 'border-tract-red focus:border-tract-red'
                        : 'border-tract-graphite/30 focus:border-tract-gold',
                    )}
                  />
                  {errors.fullName ? (
                    <p role="alert" className="mt-0.5 font-inter text-[12px] text-tract-red">
                      {errors.fullName.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[13px] font-bold uppercase tracking-[0.05em] text-gray-500">
                    Date of Birth
                  </label>
                  <input
                    {...register('dob')}
                    type="date"
                    aria-invalid={!!errors.dob}
                    className={cn(
                      'h-[48px] rounded-lg border px-4 font-inter text-[16px] text-tract-obsidian outline-none',
                      'transition-colors duration-200',
                      errors.dob
                        ? 'border-tract-red focus:border-tract-red'
                        : 'border-tract-graphite/30 focus:border-tract-gold',
                    )}
                  />
                  {errors.dob ? (
                    <p role="alert" className="mt-0.5 font-inter text-[12px] text-tract-red">
                      {errors.dob.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-inter text-[13px] font-bold uppercase tracking-[0.05em] text-gray-500">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="j.doe@marketplace.com"
                      aria-invalid={!!errors.email}
                      className={cn(
                        'h-[48px] rounded-lg border px-4 font-inter text-[16px] text-tract-obsidian outline-none',
                        'transition-colors duration-200 placeholder:text-gray-300',
                        errors.email
                          ? 'border-tract-red focus:border-tract-red'
                          : 'border-tract-graphite/30 focus:border-tract-gold',
                      )}
                    />
                    {errors.email ? (
                      <p role="alert" className="mt-0.5 font-inter text-[12px] text-tract-red">
                        {errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-inter text-[13px] font-bold uppercase tracking-[0.05em] text-gray-500">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none font-inter text-[16px] text-gray-400">
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
                          'h-[48px] w-full rounded-lg border pl-[44px] pr-4 font-inter text-[16px]',
                          'text-tract-obsidian outline-none transition-colors duration-200',
                          'placeholder:text-gray-300',
                          errors.phone
                            ? 'border-tract-red focus:border-tract-red'
                            : 'border-tract-graphite/30 focus:border-tract-gold',
                        )}
                      />
                    </div>
                    {errors.phone ? (
                      <p role="alert" className="mt-0.5 font-inter text-[12px] text-tract-red">
                        {errors.phone.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[13px] font-bold uppercase tracking-[0.05em] text-gray-500">
                    Home State
                  </label>
                  <div className="relative">
                    <select
                      {...register('stateCode')}
                      aria-invalid={!!errors.stateCode}
                      className={cn(
                        'h-[48px] w-full cursor-pointer appearance-none rounded-lg border px-4',
                        'bg-white font-inter text-[16px] text-tract-obsidian outline-none',
                        'transition-colors duration-200',
                        errors.stateCode
                          ? 'border-tract-red focus:border-tract-red'
                          : 'border-tract-graphite/30 focus:border-tract-gold',
                      )}
                    >
                      <option value="">Select a state</option>
                      {US_STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      aria-hidden
                    />
                  </div>
                  {errors.stateCode ? (
                    <p role="alert" className="mt-0.5 font-inter text-[12px] text-tract-red">
                      {errors.stateCode.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-inter text-[13px] font-bold uppercase tracking-[0.05em] text-gray-500">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={!!errors.password}
                        className={cn(
                          'h-[48px] w-full rounded-lg border px-4 pr-12 font-inter text-[16px]',
                          'text-tract-obsidian outline-none transition-colors duration-200',
                          errors.password
                            ? 'border-tract-red focus:border-tract-red'
                            : 'border-tract-graphite/30 focus:border-tract-gold',
                        )}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-gray-400 transition-colors hover:text-tract-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tract-gold"
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
                      <p role="alert" className="mt-0.5 font-inter text-[12px] text-tract-red">
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-inter text-[13px] font-bold uppercase tracking-[0.05em] text-gray-500">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        {...register('confirmPassword')}
                        type={showConfirm ? 'text' : 'password'}
                        aria-invalid={!!errors.confirmPassword}
                        className={cn(
                          'h-[48px] w-full rounded-lg border px-4 pr-12 font-inter text-[16px]',
                          'text-tract-obsidian outline-none transition-colors duration-200',
                          errors.confirmPassword
                            ? 'border-tract-red focus:border-tract-red'
                            : 'border-tract-graphite/30 focus:border-tract-gold',
                        )}
                      />
                      <button
                        type="button"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded text-gray-400 transition-colors hover:text-tract-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tract-gold"
                      >
                        {showConfirm ? (
                          <EyeOff size={16} aria-hidden />
                        ) : (
                          <Eye size={16} aria-hidden />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword ? (
                      <p role="alert" className="mt-0.5 font-inter text-[12px] text-tract-red">
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
                        className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-gray-300 text-tract-gold focus:ring-0 focus:ring-offset-0"
                      />
                    )}
                  />
                  <label htmlFor="terms" className="cursor-pointer font-inter text-[14px] leading-[1.5] text-gray-500">
                    I agree to TRACT&apos;s{' '}
                    <a
                      href="#"
                      className="font-semibold text-tract-green underline transition-colors hover:text-tract-green/80"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="font-semibold text-tract-green underline transition-colors hover:text-tract-green/80"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                {errors.terms ? (
                  <p role="alert" className="-mt-4 font-inter text-[12px] text-tract-red">
                    {errors.terms.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-10 flex w-full">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="h-[56px] w-1/2 border border-tract-graphite bg-transparent font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-tract-graphite transition-all duration-200 hover:bg-tract-graphite hover:text-white"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={sendOtpMutation.isPending}
                className="flex h-[56px] w-1/2 items-center justify-center gap-2 bg-tract-gold font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all duration-200 hover:bg-yellow-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
