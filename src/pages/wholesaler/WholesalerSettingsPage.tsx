import { useEffect, useState } from 'react'
import { BadgeCheck, Bell, Key, Loader2, Shield, User } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import TopBar from '@/components/layout/TopBar'
import { useAuthStore } from '@/store/authStore'
import { useUpdateProfile, useChangePassword } from '@/hooks/useSettings'
import { APP2_STATES } from '@/lib/constants/states'
import { cn } from '@/lib/utils'

export default function WholesalerSettingsPage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()

  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [stateCode, setStateCode] = useState(user?.stateCode ?? '')

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? '')
      setStateCode(user.stateCode ?? '')
    }
  }, [user])

  const handleProfileSave = () => {
    if (!fullName.trim()) return
    updateProfile.mutate({ fullName, stateCode })
  }

  const handlePasswordChange = () => {
    setPwdError('')
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('All fields are required.')
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match.')
      return
    }
    if (newPwd.length < 8) {
      setPwdError('Password must be at least 8 characters.')
      return
    }
    changePassword.mutate(
      { currentPassword: currentPwd, newPassword: newPwd },
      {
        onSuccess: () => {
          setCurrentPwd('')
          setNewPwd('')
          setConfirmPwd('')
        },
      },
    )
  }

  const inputClass = cn(
    'w-full rounded-[8px] border border-theme-border',
    'bg-theme-input px-4 py-3 font-inter text-[14px]',
    'text-theme-text outline-none',
    'transition-colors placeholder:text-theme-faint',
    'focus:border-tract-gold focus:ring-1',
    'focus:ring-tract-gold',
  )

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="Settings" />

        <div className="mx-auto max-w-[800px] space-y-6 p-6 md:p-10">
          <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <User className="h-5 w-5 text-tract-gold" strokeWidth={1.75} />
              <h2 className="font-playfair text-[22px] font-bold text-theme-text">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className={cn(inputClass, 'cursor-not-allowed bg-theme-surface-2 text-theme-muted')}
                />
                <p className="mt-1 font-inter text-[11px] text-theme-muted">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  Home State
                </label>
                <select value={stateCode} onChange={(e) => setStateCode(e.target.value)} className={inputClass}>
                  <option value="">Select state</option>
                  {APP2_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role ?? ''}
                  disabled
                  className={cn(inputClass, 'cursor-not-allowed bg-theme-surface-2 capitalize text-theme-muted')}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={updateProfile.isPending}
              onClick={handleProfileSave}
              className="mt-6 flex items-center gap-2 bg-tract-gold px-6 py-3 font-inter text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
            >
              {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>

          <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Key className="h-5 w-5 text-tract-gold" strokeWidth={1.75} />
              <h2 className="font-playfair text-[22px] font-bold text-theme-text">Change Password</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className={inputClass}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                />
              </div>

              <div>
                <label className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>

              {pwdError ? <p className="font-inter text-[13px] text-tract-red">{pwdError}</p> : null}
            </div>

            <button
              type="button"
              disabled={changePassword.isPending}
              onClick={handlePasswordChange}
              className="mt-6 flex items-center gap-2 bg-tract-obsidian px-6 py-3 font-inter text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </button>
          </div>

          <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Shield className="h-5 w-5 text-tract-gold" strokeWidth={1.75} />
              <h2 className="font-playfair text-[22px] font-bold text-theme-text">Verification</h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: 'Identity (KYC)',
                  status: user?.kycStatus ?? 'pending',
                  done: user?.kycStatus === 'approved',
                  link: '/settings/kyc',
                  action: 'Verify now',
                },
                {
                  label: 'Bank Account',
                  status: user?.bankVerified ? 'Linked' : 'Not linked',
                  done: user?.bankVerified ?? false,
                  link: '/register/bank',
                  action: 'Link bank',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[10px] border border-theme-border bg-theme-surface-2 p-4"
                >
                  <div>
                    <p className="font-inter text-[14px] font-bold text-theme-text">{item.label}</p>
                    <p
                      className={cn(
                        'mt-0.5 font-inter text-[12px] capitalize',
                        item.done ? 'text-tract-green' : 'text-theme-muted',
                      )}
                    >
                      {item.status}
                    </p>
                  </div>
                  {item.done ? (
                    <BadgeCheck className="h-5 w-5 text-tract-green" strokeWidth={1.75} />
                  ) : (
                    <a
                      href={item.link}
                      className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                    >
                      {item.action}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Bell className="h-5 w-5 text-tract-gold" strokeWidth={1.75} />
              <h2 className="font-playfair text-[22px] font-bold text-theme-text">Notifications</h2>
            </div>
            <p className="font-inter text-[14px] text-theme-muted">
              Notification preferences will be available in the next release.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
