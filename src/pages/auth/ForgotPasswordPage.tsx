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
    'h-[48px] w-full rounded-lg border px-4 font-inter text-[16px] text-tract-obsidian outline-none placeholder:text-gray-300 transition-colors duration-200',
    'border-gray-200 focus:border-tract-gold',
  )

  const inputError = cn(
    'h-[48px] w-full rounded-lg border px-4 font-inter text-[16px] text-tract-obsidian outline-none placeholder:text-gray-300 transition-colors duration-200',
    'border-tract-red focus:border-tract-red',
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-tract-alabaster px-4 py-8 font-inter">
      <div className="w-full max-w-[480px]">
        <BackButton to="/login" label="Back to Sign In" className="mb-8" />

        <div className="rounded-[12px] border border-gray-100 bg-white p-6 shadow-sm md:p-10">
          {step === 1 && (
            <>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-tract-green-light">
                <Mail className="h-6 w-6 text-tract-green" strokeWidth={1.5} />
              </div>
              <h1 className="mb-2 font-playfair text-[28px] font-bold text-tract-obsidian">Reset password</h1>
              <p className="mb-8 font-inter text-[15px] text-gray-500">
                Enter your email and we&apos;ll send you a 6-digit reset code.
              </p>
              <form
                onSubmit={emailForm.handleSubmit((d) => sendMutation.mutate(d))}
                noValidate
                className="space-y-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-bold uppercase tracking-[0.05em] text-gray-500">
                    Email Address
                  </label>
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={emailForm.formState.errors.email ? inputError : inputClass}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="font-inter text-[12px] text-tract-red">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={sendMutation.isPending}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-tract-gold font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600 disabled:opacity-60"
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
              <h1 className="mb-2 font-playfair text-[28px] font-bold text-tract-obsidian">Enter reset code</h1>
              <p className="mb-8 font-inter text-[15px] text-gray-500">
                We sent a 6-digit code to <span className="font-semibold text-tract-obsidian">{email}</span>
              </p>
              <form
                onSubmit={resetForm.handleSubmit((d) => resetMutation.mutate(d))}
                noValidate
                className="space-y-5"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-bold uppercase tracking-[0.05em] text-gray-500">
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
                      'text-center font-playfair text-[24px] tracking-[0.5em]',
                    )}
                  />
                  {resetForm.formState.errors.token && (
                    <p className="font-inter text-[12px] text-tract-red">{resetForm.formState.errors.token.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-bold uppercase tracking-[0.05em] text-gray-500">
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tract-obsidian"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="font-inter text-[12px] text-tract-red">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[12px] font-bold uppercase tracking-[0.05em] text-gray-500">
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tract-obsidian"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="font-inter text-[12px] text-tract-red">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="flex h-12 w-full items-center justify-center gap-2 bg-tract-green font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:opacity-90 disabled:opacity-60"
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
                  className="w-full text-center font-inter text-[13px] text-gray-400 transition-colors hover:text-tract-obsidian"
                >
                  ← Try a different email
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-tract-green-light">
                <CheckCircle2 className="h-6 w-6 text-tract-green" strokeWidth={1.5} />
              </div>
              <h1 className="mb-3 font-playfair text-[28px] font-bold text-tract-obsidian">Password reset!</h1>
              <p className="mb-8 font-inter text-[15px] text-gray-500">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex h-12 w-full items-center justify-center bg-tract-gold font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600"
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
