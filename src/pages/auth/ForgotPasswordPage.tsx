import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Mail, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import BackButton from '@/components/auth/BackButton'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const emailSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

const resetSchema = z
  .object({
    token: z
      .string()
      .length(6, 'Code must be 6 digits')
      .regex(/^\d{6}$/, 'Code must be numbers only'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain 1 uppercase letter')
      .regex(/[0-9]/, 'Must contain 1 number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type EmailData = z.infer<typeof emailSchema>
type ResetData = z.infer<typeof resetSchema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const emailForm = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
  })

  const resetForm = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
  })

  const sendMutation = useMutation({
    mutationFn: async (data: EmailData) => {
      await api.post('/auth/forgot-password', data)
    },
    onSuccess: (_d, vars) => {
      setEmail(vars.email)
      setStep(2)
      toast.success('Reset code sent to your email.')
    },
    onError: (_d, vars) => {
      setEmail(vars.email)
      setStep(2)
      toast.success('Reset code sent if account exists.')
    },
  })

  const resetMutation = useMutation({
    mutationFn: async (data: ResetData) => {
      await api.post('/auth/reset-password', {
        email,
        token: data.token,
        newPassword: data.newPassword,
      })
    },
    onSuccess: () => {
      setStep(3)
      toast.success('Password reset successfully!')
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { data?: { message?: string | string[] } } }
      const m = ax.response?.data?.message
      const msg = Array.isArray(m) ? m.join(', ') : (m ?? 'Invalid or expired code. Try again.')
      toast.error(msg)
    },
  })

  const inputClass = cn(
    'h-12 w-full rounded-lg border border-app1-border-light bg-app1-bg-soft px-4 font-poppins text-[14px] text-app1-text-main outline-none placeholder:text-app1-text-muted transition-colors',
    'focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30',
  )

  const inputError = cn(
    'h-12 w-full rounded-lg border border-app1-danger bg-app1-bg-soft px-4 font-poppins text-[14px] text-app1-text-main outline-none placeholder:text-app1-text-muted transition-colors',
    'focus:border-app1-danger focus:ring-2 focus:ring-app1-danger/30',
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-app1-bg-main px-4 py-8 font-poppins">
      <div className="w-full max-w-[480px]">
        <BackButton to="/login" label="Back to Sign In" className="mb-8" />

        <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-10">
          {step === 1 && (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-app1-primary/10">
                <Mail className="h-6 w-6 text-app1-primary" strokeWidth={1.5} />
              </div>
              <h1 className="mb-2 font-cinzel text-[28px] font-black text-app1-primary">Reset password</h1>
              <p className="mb-8 font-poppins text-[15px] text-app1-text-muted">
                Enter your email and we&apos;ll send you a 6-digit reset code.
              </p>
              <form
                onSubmit={emailForm.handleSubmit((d) => sendMutation.mutate(d))}
                noValidate
                className="space-y-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    Email Address
                  </label>
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={emailForm.formState.errors.email ? inputError : inputClass}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="font-poppins text-[12px] text-app1-danger">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {sendMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="mb-2 font-cinzel text-[28px] font-black text-app1-primary">Enter reset code</h1>
              <p className="mb-8 font-poppins text-[15px] text-app1-text-muted">
                We sent a 6-digit code to <span className="font-bold text-app1-text-main">{email}</span>
              </p>
              <form
                onSubmit={resetForm.handleSubmit((d) => resetMutation.mutate(d))}
                noValidate
                className="space-y-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    Reset Code
                  </label>
                  <input
                    {...resetForm.register('token')}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className={cn(
                      resetForm.formState.errors.token ? inputError : inputClass,
                      'text-center font-cinzel text-[24px] tracking-[0.5em]',
                    )}
                  />
                  {resetForm.formState.errors.token && (
                    <p className="font-poppins text-[12px] text-app1-danger">{resetForm.formState.errors.token.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      {...resetForm.register('newPassword')}
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Min 8 chars, 1 uppercase, 1 number"
                      className={cn(
                        resetForm.formState.errors.newPassword ? inputError : inputClass,
                        'pr-12',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-app1-text-muted hover:text-app1-text-main"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="font-poppins text-[12px] text-app1-danger">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...resetForm.register('confirmPassword')}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      className={cn(
                        resetForm.formState.errors.confirmPassword ? inputError : inputClass,
                        'pr-12',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-app1-text-muted hover:text-app1-text-main"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="font-poppins text-[12px] text-app1-danger">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-app1-primary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {resetMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center font-poppins text-[13px] text-app1-text-muted transition-colors hover:text-app1-text-main"
                >
                  ← Try a different email
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-app1-primary/10">
                <CheckCircle2 className="h-6 w-6 text-app1-primary" strokeWidth={1.5} />
              </div>
              <h1 className="mb-3 font-cinzel text-[28px] font-black text-app1-primary">Password reset!</h1>
              <p className="mb-8 font-poppins text-[15px] text-app1-text-muted">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex h-12 w-full items-center justify-center bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02]"
              >
                Sign In Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
