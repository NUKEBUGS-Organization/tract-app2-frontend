import { Link } from 'react-router-dom'
import { BadgeCheck, Building2, CheckCircle2, FileText, Shield } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/authStore'
import { useMyScore } from '@/hooks/useDeal'
import { cn } from '@/lib/utils'

function scoreTier(score: number) {
  if (score >= 85) return { label: 'Elite', color: 'text-app1-primary', bg: 'bg-app1-primary/10' }
  if (score >= 70) return { label: 'Good Standing', color: 'text-app1-primary', bg: 'bg-app1-primary/10' }
  if (score >= 50) return { label: 'At Risk', color: 'text-app1-warning', bg: 'bg-app1-warning/10' }
  return { label: 'Restricted', color: 'text-app1-danger', bg: 'bg-app1-danger/10' }
}

export default function BuyerProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { data } = useMyScore()
  const score = data?.reliabilityScore ?? user?.reliabilityScore ?? 100
  const tier = scoreTier(score)
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Buyer'

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[900px] space-y-6 p-6 md:p-10">

          <div className="mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Buyer Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
              Profile & Score
            </h1>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-app1-primary font-cinzel text-[28px] font-black text-white">
                  {firstName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-cinzel text-[24px] font-black text-app1-primary">{user?.fullName ?? 'Buyer'}</h2>
                  <p className="mt-0.5 font-poppins text-[13px] text-app1-text-muted">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-app1-primary/10 px-3 py-0.5 font-poppins text-[11px] font-black uppercase tracking-wide text-app1-primary">
                      {user?.role ?? 'Buyer'}
                    </span>
                    {user?.stateCode ? (
                      <span className="inline-block rounded-full bg-app1-bg-soft px-3 py-0.5 font-poppins text-[11px] font-black uppercase tracking-wide text-app1-text-muted">
                        {user.stateCode}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              {user?.app2_isVettedBuyer ? (
                <div className="flex items-center gap-2 rounded-full border border-app1-secondary/30 bg-app1-secondary/10 px-4 py-2">
                  <BadgeCheck className="h-4 w-4 text-app1-secondary" strokeWidth={1.75} />
                  <span className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary">Vetted Buyer</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 text-center shadow-app1-card">
            <p className="mb-4 font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-text-muted">Reliability Score</p>
            <div className={cn('font-cinzel text-[96px] font-black leading-none', tier.color)}>{score}</div>
            <span
              className={cn(
                'mt-4 inline-block rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.18em]',
                tier.color,
                tier.bg,
              )}
            >
              {tier.label}
            </span>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <h3 className="mb-6 font-cinzel text-[20px] font-black text-app1-primary">Verification Status</h3>
            <div className="space-y-4">
              {[
                {
                  label: 'Identity (KYC)',
                  status: user?.kycStatus ?? 'pending',
                  done: user?.kycStatus === 'approved',
                  icon: Shield,
                  link: '/register/kyc',
                  action: 'Verify now',
                },
                {
                  label: 'Bank Account',
                  status: user?.bankVerified ? 'Linked' : 'Not linked',
                  done: user?.bankVerified ?? false,
                  icon: Building2,
                  link: '/register/bank',
                  action: 'Link bank',
                },
                {
                  label: 'Proof of Funds',
                  status:
                    user?.pofStatus === 'approved'
                      ? 'Verified'
                      : user?.pofStatus === 'pending'
                        ? 'Under Review'
                        : user?.pofStatus === 'rejected'
                          ? 'Rejected — Resubmit'
                          : 'Not submitted',
                  done: user?.pofStatus === 'approved',
                  icon: FileText,
                  link: '/buyer/proof-of-funds',
                  action: user?.pofStatus === 'pending' ? 'View status' : 'Submit now',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft p-4"
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn('h-5 w-5 shrink-0', item.done ? 'text-app1-primary' : 'text-app1-text-muted')}
                      strokeWidth={1.75}
                    />
                    <div>
                      <p className="font-poppins text-[14px] font-black text-app1-text-main">{item.label}</p>
                      <p className={cn('mt-0.5 font-poppins text-[12px] capitalize', item.done ? 'text-app1-primary' : 'text-app1-text-muted')}>
                        {item.status}
                      </p>
                    </div>
                  </div>
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-app1-primary" strokeWidth={1.75} />
                  ) : (
                    <Link
                      to={item.link}
                      className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline"
                    >
                      {item.action}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <h3 className="mb-6 font-cinzel text-[20px] font-black text-app1-primary">Account Details</h3>
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: user?.fullName ?? '—' },
                { label: 'Email', value: user?.email ?? '—' },
                { label: 'Phone', value: '•••••••••••' },
                { label: 'Home State', value: user?.stateCode ?? '—' },
                {
                  label: 'Member Since',
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : '—',
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-app1-border-light py-3 last:border-0"
                >
                  <span className="font-poppins text-[13px] text-app1-text-muted">{row.label}</span>
                  <span className="font-poppins text-[13px] font-bold text-app1-text-main">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
