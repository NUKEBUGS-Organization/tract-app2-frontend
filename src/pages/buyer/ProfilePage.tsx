import { Link } from 'react-router-dom'
import { BadgeCheck, Building2, CheckCircle2, Shield } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { useAuthStore } from '@/store/authStore'
import { useMyScore } from '@/hooks/useDeal'
import { cn } from '@/lib/utils'

function scoreTier(score: number) {
  if (score >= 85) return { label: 'Elite', color: 'text-tract-green', bg: 'bg-tract-green-light' }
  if (score >= 70) return { label: 'Good Standing', color: 'text-tract-green', bg: 'bg-tract-green-light' }
  if (score >= 50) return { label: 'At Risk', color: 'text-tract-orange', bg: 'bg-orange-50' }
  return { label: 'Restricted', color: 'text-tract-red', bg: 'bg-tract-red-light' }
}

export default function BuyerProfilePage() {
  const user = useAuthStore((s) => s.user)
  const { data } = useMyScore()
  const score = data?.reliabilityScore ?? user?.reliabilityScore ?? 100
  const tier = scoreTier(score)
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Buyer'

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-tract-alabaster">
        <TopBar title="Profile & Score" />
        <div className="mx-auto max-w-[900px] space-y-6 p-6 md:p-10">
          <div className="rounded-[12px] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tract-green font-playfair text-[28px] font-bold text-white">
                  {firstName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-playfair text-[24px] font-bold text-tract-obsidian">{user?.fullName ?? 'Buyer'}</h2>
                  <p className="mt-0.5 font-inter text-[13px] text-gray-400">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-block rounded-full bg-tract-green/10 px-3 py-0.5 font-inter text-[11px] font-bold uppercase tracking-wider text-tract-green">
                      {user?.role ?? 'Buyer'}
                    </span>
                    {user?.stateCode ? (
                      <span className="inline-block rounded-full bg-gray-100 px-3 py-0.5 font-inter text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {user.stateCode}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              {user?.app2_isVettedBuyer ? (
                <div className="flex items-center gap-2 rounded-full border border-tract-gold/30 bg-tract-gold/5 px-4 py-2">
                  <BadgeCheck className="h-4 w-4 text-tract-gold" strokeWidth={1.75} />
                  <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold">Vetted Buyer</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[12px] border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="mb-4 font-inter text-[12px] font-bold uppercase tracking-widest text-gray-400">Reliability Score</p>
            <div className={cn('font-playfair text-[96px] font-bold leading-none', tier.color)}>{score}</div>
            <span
              className={cn(
                'mt-4 inline-block rounded-full px-4 py-1.5 font-inter text-[12px] font-bold uppercase tracking-widest',
                tier.color,
                tier.bg,
              )}
            >
              {tier.label}
            </span>
          </div>

          <div className="rounded-[12px] border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 font-playfair text-[20px] font-bold text-tract-obsidian">Verification Status</h3>
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
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[10px] border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={cn('h-5 w-5 shrink-0', item.done ? 'text-tract-green' : 'text-gray-400')}
                      strokeWidth={1.75}
                    />
                    <div>
                      <p className="font-inter text-[14px] font-bold text-tract-obsidian">{item.label}</p>
                      <p className={cn('mt-0.5 font-inter text-[12px] capitalize', item.done ? 'text-tract-green' : 'text-gray-400')}>
                        {item.status}
                      </p>
                    </div>
                  </div>
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-tract-green" strokeWidth={1.75} />
                  ) : (
                    <Link
                      to={item.link}
                      className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                    >
                      {item.action}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[12px] border border-gray-100 bg-white p-8 shadow-sm">
            <h3 className="mb-6 font-playfair text-[20px] font-bold text-tract-obsidian">Account Details</h3>
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
                  className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0"
                >
                  <span className="font-inter text-[13px] text-gray-500">{row.label}</span>
                  <span className="font-inter text-[13px] font-semibold text-tract-obsidian">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
