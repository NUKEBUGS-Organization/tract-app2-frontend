import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2, ShoppingBag, Handshake, BadgeCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import HomeStateSelect from '@/components/auth/HomeStateSelect'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import RoleCard from '@/components/auth/RoleCard'
import api from '@/lib/api'
import { isKycEnabled } from '@/lib/kyc'
import { cn } from '@/lib/utils'
import { googleCompleteSchema, type GoogleCompleteFormData } from '@/lib/validators/auth'
import { useAuthStore } from '@/store/authStore'
import type { User, UserRole } from '@/types'

const ROLES: { value: UserRole; icon: LucideIcon; title: string; description: string }[] = [
  { value: 'buyer', icon: ShoppingBag, title: "I'm a Buyer", description: 'I want to purchase wholesale properties' },
  { value: 'wholesaler', icon: Handshake, title: "I'm a Wholesaler", description: 'I want to list and wholesale deals' },
  { value: 'realtor', icon: BadgeCheck, title: "I'm a Licensed Realtor", description: 'I represent buyers or transactions in my state' },
]

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

export default function GoogleCompleteRegistrationPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''
  const fullName = searchParams.get('fullName') ?? ''

  useEffect(() => {
    if (!token || !email) {
      toast.error('Missing Google sign-up details. Please try again.')
      navigate('/register', { replace: true })
    }
  }, [token, email, navigate])

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoogleCompleteFormData>({
    resolver: zodResolver(googleCompleteSchema),
    defaultValues: { role: undefined, dob: '', phone: '', stateCode: '' },
  })

  const role = watch('role')

  const completeMutation = useMutation({
    mutationFn: async (data: GoogleCompleteFormData) => {
      const { data: envelope } = await api.post<{
        success: boolean
        data: { accessToken: string; user: User }
      }>('/auth/google/complete', {
        token,
        role: data.role,
        dob: data.dob,
        phone: '+1' + data.phone.replace(/\D/g, ''),
        stateCode: data.stateCode,
      })
      return envelope.data
    },
    onSuccess: (payload) => {
      useAuthStore.getState().setSession(payload.accessToken, payload.user)
      toast.success('Account created with Google.')
      navigate(isKycEnabled ? '/register/kyc' : '/register/bank')
    },
    onError: (err: unknown) => {
      toastApiError(err, 'Could not complete sign-up. Please try again.')
    },
  })

  const onSubmit = (data: GoogleCompleteFormData) => completeMutation.mutate(data)

  const inputBase =
    'h-12 rounded-lg border px-4 font-poppins text-[14px] text-app1-text-main outline-none transition-colors placeholder:text-app1-text-muted'
  const inputNormal = `${inputBase} border-app1-border-light bg-app1-bg-soft focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30`
  const inputInvalid = `${inputBase} border-app1-danger focus:border-app1-danger focus:ring-2 focus:ring-app1-danger/30`

  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins">
      <OnboardingHeader currentStep={1} />

      <main className="grow pb-10 pl-4 pr-4 pt-[152px] md:px-0">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-6 text-center">
            <h1 className="mb-1 font-cinzel text-[32px] font-black leading-tight text-app1-primary md:text-[36px]">
              Almost there, {fullName.split(' ')[0] || 'there'}.
            </h1>
            <p className="font-poppins text-[16px] text-app1-text-muted">
              Signed in as {email}. A few more details to finish setting up your TRACT account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card md:p-10">
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    What best describes you?
                  </label>
                  <div className="space-y-3">
                    {ROLES.map((r) => (
                      <RoleCard
                        key={r.value}
                        icon={r.icon}
                        title={r.title}
                        description={r.description}
                        selected={role === r.value}
                        onClick={() => setValue('role', r.value, { shouldValidate: true })}
                      />
                    ))}
                  </div>
                  {errors.role ? (
                    <p role="alert" className="mt-2 font-poppins text-[12px] text-app1-danger">
                      {errors.role.message}
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

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="home-state"
                      className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted"
                    >
                      Home State
                    </label>
                    <HomeStateSelect
                      control={control}
                      name="stateCode"
                      error={errors.stateCode}
                      inputNormal={inputNormal}
                      inputInvalid={inputInvalid}
                    />
                    {errors.stateCode ? (
                      <p role="alert" className="mt-0.5 font-poppins text-[12px] text-app1-danger">
                        {errors.stateCode.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex w-full">
              <button
                type="submit"
                disabled={completeMutation.isPending}
                className="flex h-14 w-full items-center justify-center gap-2 bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {completeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                    Creating account...
                  </>
                ) : (
                  'Finish creating account'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
