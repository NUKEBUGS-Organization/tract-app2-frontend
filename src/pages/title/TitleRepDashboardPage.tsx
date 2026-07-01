import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BadgeCheck, Briefcase, Calendar, DollarSign, Loader2, Lock, RefreshCw } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import HeroBanner from '@/components/app1/HeroBanner'
import StatCard from '@/components/app1/StatCard'
import { useAuthStore } from '@/store/authStore'
import { cn, formatCurrency } from '@/lib/utils'
import { useTitleDashboard, useAdvanceTitleStep, useConfirmEmd } from '@/hooks/useTitle'

type DealFilter = 'all' | 'action' | 'track'

export default function TitleRepDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const displayName = user?.fullName?.trim() || 'Title Representative'
  const company = 'First American Title'

  const [dealFilter, setDealFilter] = useState<DealFilter>('all')

  const { data, isLoading, isError, refetch } = useTitleDashboard()
  const advanceStep = useAdvanceTitleStep()
  const confirmEmd = useConfirmEmd()

  const verifyYear = useMemo(() => new Date().getFullYear() + 1, [])

  const stats = data?.stats
  const allDeals = data?.activeDeals ?? []
  const emds = data?.pendingEmds ?? []

  const filteredDeals = useMemo(() => {
    if (dealFilter === 'action') return allDeals.filter((d) => d.needsAction)
    if (dealFilter === 'track') return allDeals.filter((d) => !d.needsAction)
    return allDeals
  }, [allDeals, dealFilter])

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<TitleRepSidebar />}>
        <div className="flex min-h-screen items-center justify-center bg-app1-bg-main">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<TitleRepSidebar />}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-app1-bg-main gap-4">
          <AlertTriangle className="h-10 w-10 text-app1-danger" />
          <p className="font-poppins text-app1-text-muted">Failed to load dashboard.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<TitleRepSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">
          <HeroBanner
            eyebrow="Title Workspace"
            title={`Welcome, ${displayName}.`}
            description={`Manage active deals, confirm earnest money deposits, and advance pipeline steps for ${company}.`}
            badgeText="Live title metrics"
            actions={
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            }
          />

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <StatCard
              label="Active Deals"
              value={stats?.activeDeals ?? 0}
              note="Currently assigned"
              icon={Briefcase}
              tone="primary"
            />
            <StatCard
              label="Pending EMDs"
              value={stats?.pendingEmds ?? 0}
              note="Awaiting confirmation"
              icon={DollarSign}
              tone="warning"
            />
            <StatCard
              label="Closing This Week"
              value={stats?.closingThisWeek ?? 0}
              note="Scheduled closings"
              icon={Calendar}
              tone="neutral"
            />
            <StatCard
              label="Needs Your Action"
              value={stats?.dealsNeedingAction ?? 0}
              note="Require confirmation"
              icon={AlertTriangle}
              tone={stats?.dealsNeedingAction ? 'danger' : 'neutral'}
            />
          </div>

          <section className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
            <div className="flex flex-col gap-4 border-b border-app1-border-light px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="font-cinzel text-xl font-black text-app1-primary">My Active Deals</h3>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'all' as const, label: 'All' },
                    { id: 'action' as const, label: 'Needs Action' },
                    { id: 'track' as const, label: 'On Track' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setDealFilter(f.id)}
                    className={cn(
                      'rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
                      dealFilter === f.id
                        ? 'bg-app1-secondary text-app1-primary-dark'
                        : 'border border-app1-border-light bg-app1-bg-card text-app1-text-muted hover:bg-app1-bg-soft',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                    {['Property', 'Buyer', 'Current Step', 'Next Action', 'EMD', 'Advance'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted',
                          h === 'Advance' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app1-border-light font-poppins text-sm text-app1-text-main">
                  {filteredDeals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center font-poppins text-sm text-app1-text-muted">
                        {allDeals.length === 0 ? 'No deals assigned to you yet.' : 'No deals match this filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDeals.map((deal) => (
                      <tr key={deal.id} className="transition-colors hover:bg-app1-bg-soft/60">
                        <td className="px-6 py-5">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-poppins text-[14px] font-black text-app1-primary hover:text-app1-secondary hover:underline"
                          >
                            {deal.propertyLine || '—'}
                          </Link>
                          {deal.city ? (
                            <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                              {deal.city}
                              {deal.stateCode ? `, ${deal.stateCode}` : ''}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-6 py-5 text-app1-text-muted">{deal.buyerName}</td>
                        <td className="px-6 py-5">
                          <span className="rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                            {deal.stepLabel}
                          </span>
                        </td>
                        <td className={cn('px-6 py-5', !deal.needsAction && 'italic text-app1-text-muted')}>
                          {deal.nextAction}
                        </td>
                        <td className="px-6 py-5 text-app1-text-muted">
                          {deal.emdAmount > 0 ? formatCurrency(deal.emdAmount) : '—'}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {deal.advanceLabel ? (
                            <button
                              type="button"
                              disabled={advanceStep.isPending}
                              onClick={() => advanceStep.mutate(deal.id)}
                              className="rounded-xl bg-app1-secondary px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                              {deal.advanceLabel}
                            </button>
                          ) : (
                            <span className="text-app1-text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mx-6 mb-6 mt-4 flex gap-4 rounded-xl border border-app1-warning/30 bg-app1-warning/5 p-4">
              <Lock className="h-5 w-5 shrink-0 text-app1-warning" strokeWidth={2} aria-hidden />
              <p className="font-poppins text-[13px] leading-snug text-app1-text-muted">
                You are the sole authority for pipeline steps 4 through 8. Buyers and wholesalers cannot advance these
                steps without your confirmation.
              </p>
            </div>
          </section>

          <section className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
            <h3 className="mb-6 font-cinzel text-xl font-black text-app1-primary">Pending EMD Confirmations</h3>

            {emds.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <BadgeCheck className="h-10 w-10 text-app1-secondary" strokeWidth={1} />
                <p className="font-poppins text-sm text-app1-text-muted">No pending EMD confirmations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emds.map((emd) => {
                  const isPending = emd.emdStatus === 'pending'
                  return (
                    <div
                      key={emd.dealId}
                      className={cn(
                        'flex flex-col gap-4 rounded-app1-card border p-6 sm:flex-row sm:items-center sm:justify-between',
                        isPending
                          ? 'border-app1-border-light bg-app1-bg-soft'
                          : 'border-app1-border-light bg-app1-bg-soft opacity-80',
                      )}
                    >
                      <div className="flex flex-wrap gap-8">
                        <div>
                          <p className="font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                            Property
                          </p>
                          <p className="font-poppins font-black text-app1-primary">{emd.propertyLine}</p>
                        </div>
                        <div>
                          <p className="font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                            Buyer
                          </p>
                          <p className="font-poppins text-sm text-app1-text-muted">{emd.buyerName}</p>
                        </div>
                        <div>
                          <p className="font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                            Amount
                          </p>
                          <p className="font-poppins text-sm font-semibold tracking-wide text-app1-secondary">
                            {formatCurrency(emd.emdAmount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <span
                          className={cn(
                            'rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em]',
                            isPending
                              ? 'border border-app1-secondary/20 bg-app1-secondary/10 text-app1-secondary'
                              : 'border border-app1-primary/20 bg-app1-primary/10 text-app1-primary',
                          )}
                        >
                          {isPending ? 'Pending' : 'Received ✓'}
                        </span>
                        {isPending ? (
                          <button
                            type="button"
                            disabled={confirmEmd.isPending}
                            onClick={() => confirmEmd.mutate(emd.dealId)}
                            className="rounded-xl bg-app1-secondary px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          >
                            Confirm receipt
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
            <div className="mb-2 flex items-center gap-3">
              <BadgeCheck className="h-6 w-6 shrink-0 text-app1-secondary" strokeWidth={2} aria-hidden />
              <h4 className="font-cinzel text-xl font-black text-app1-primary">Compliance Status</h4>
            </div>
            <p className="mb-4 font-poppins text-base text-app1-text-muted">
              Your credentials as a title representative for {company} are active and verified through {verifyYear}.
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-app1-bg-soft">
              <div className="h-full w-full bg-app1-secondary" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
