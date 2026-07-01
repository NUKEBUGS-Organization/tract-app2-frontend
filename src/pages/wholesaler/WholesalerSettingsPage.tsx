import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Save, Lock } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function WholesalerSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register: profileReg,
    handleSubmit: profileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSaving },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
    },
  })

  const {
    register: passwordReg,
    handleSubmit: passwordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSaving },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const res = await api.patch('/users/me', data)
      if (res.data?.data) {
        setUser({ ...user!, ...res.data.data })
      }
      toast.success('Profile updated.')
    } catch {
      toast.error('Failed to update profile.')
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully.')
      resetPassword()
    } catch {
      toast.error('Failed to change password. Check your current password.')
    }
  }

  const inputClass = cn(
    'w-full rounded-lg border border-app1-border-light bg-app1-bg-soft',
    'px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none',
    'placeholder:text-app1-text-muted transition-colors',
    'focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30',
  )

  const labelClass = 'block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted mb-2'
  const errorClass = 'mt-1 font-poppins text-[12px] text-app1-danger'

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[700px] space-y-6 p-6 md:p-10">

          <div className="mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Wholesaler Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
              Settings
            </h1>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <h2 className="mb-6 font-cinzel text-[22px] font-black text-app1-primary">
              Profile Information
            </h2>
            <form onSubmit={profileSubmit(onSaveProfile)} className="space-y-5">
              <div>
                <label htmlFor="fullName" className={labelClass}>Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  {...profileReg('fullName')}
                  className={inputClass}
                  placeholder="Your full name"
                />
                {profileErrors.fullName && (
                  <p className={errorClass}>{profileErrors.fullName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>Email Address</label>
                <input
                  id="email"
                  type="email"
                  {...profileReg('email')}
                  className={inputClass}
                  placeholder="your@email.com"
                />
                {profileErrors.email && (
                  <p className={errorClass}>{profileErrors.email.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <input
                  type="text"
                  value={user?.role ?? ''}
                  disabled
                  className={cn(inputClass, 'cursor-not-allowed opacity-50')}
                />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  value={user?.stateCode ?? ''}
                  disabled
                  className={cn(inputClass, 'cursor-not-allowed opacity-50')}
                />
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {profileSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <div className="mb-6 flex items-center gap-3">
              <Lock className="h-6 w-6 text-app1-secondary" strokeWidth={1.75} />
              <h2 className="font-cinzel text-[22px] font-black text-app1-primary">
                Change Password
              </h2>
            </div>
            <form onSubmit={passwordSubmit(onChangePassword)} className="space-y-5">
              <div>
                <label htmlFor="currentPassword" className={labelClass}>Current Password</label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    {...passwordReg('currentPassword')}
                    className={cn(inputClass, 'pr-12')}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-app1-text-muted hover:text-app1-text-main"
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className={errorClass}>{passwordErrors.currentPassword.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="newPassword" className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    {...passwordReg('newPassword')}
                    className={cn(inputClass, 'pr-12')}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-app1-text-muted hover:text-app1-text-main"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className={errorClass}>{passwordErrors.newPassword.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    {...passwordReg('confirmPassword')}
                    className={cn(inputClass, 'pr-12')}
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-app1-text-muted hover:text-app1-text-main"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className={errorClass}>{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={passwordSaving}
                className="flex items-center gap-2 bg-app1-primary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {passwordSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <h2 className="mb-2 font-cinzel text-[22px] font-black text-app1-primary">
              Notifications
            </h2>
            <p className="font-poppins text-[14px] text-app1-text-muted">
              Notification preferences coming soon.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
