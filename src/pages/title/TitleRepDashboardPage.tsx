import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BadgeCheck, Loader2, Lock, RefreshCw } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
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

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<TitleRepSidebar />}>
        <div className="flex min-h-screen items-center justify-center bg-theme-bg">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<TitleRepSidebar />}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-theme-bg gap-4">
          <AlertTriangle className="h-10 w-10 text-tract-red" />
          <p className="font-inter text-theme-muted">Failed to load dashboard.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 font-inter text-sm font-bold uppercase tracking-wider text-tract-gold hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const stats = data?.stats
  const allDeals = data?.activeDeals ?? []
  const emds = data?.pendingEmds ?? []

  const filteredDeals = useMemo(() => {
    if (dealFilter === 'action') return allDeals.filter((d) => d.needsAction)
    if (dealFilter === 'track') return allDeals.filter((d) => !d.needsAction)
    return allDeals
  }, [allDeals, dealFilter])

  return (
    <DashboardLayout sidebar={<TitleRepSidebar />}>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-theme-border bg-theme-topbar px-4 md:px-6">
        <h2 className="font-playfair text-xl font-bold text-theme-text md:text-2xl">Title Dashboard</h2>
        <div className="flex items-center gap-4 md:gap-8">
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 font-inter text-sm text-theme-muted hover:text-theme-text transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden font-inter text-sm text-theme-muted sm:inline">
              {displayName} · {company}
            </span>
            <img src={DEFAULT_AVATAR_IMAGE} alt="" className="h-8 w-8 rounded-full object-cover" />
          </div>
        </div>
      </header>

      <main className="min-h-screen bg-theme-bg p-8 md:p-12">
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            {
              label: 'Active Deals',
              value: stats?.activeDeals ?? 0,
              color: 'text-tract-gold',
              hover: 'hover:border-tract-gold',
            },
            {
              label: 'Pending EMDs',
              value: stats?.pendingEmds ?? 0,
              color: 'text-tract-orange',
              hover: 'hover:border-tract-orange',
            },
            {
              label: 'Closing This Week',
              value: stats?.closingThisWeek ?? 0,
              color: 'text-tract-green',
              hover: 'hover:border-[#b0db91]',
            },
            {
              label: 'Needs Your Action',
              value: stats?.dealsNeedingAction ?? 0,
              color: stats?.dealsNeedingAction ? 'text-tract-red' : 'text-theme-muted',
              hover: 'hover:border-tract-red',
            },
          ].map((c) => (
            <div
              key={c.label}
              className={cn(
                'flex flex-col justify-between rounded-2xl border border-tract-graphite bg-tract-graphite p-6 transition-transform duration-300 hover:scale-[1.02]',
                c.hover,
              )}
            >
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">{c.label}</span>
              <span className={cn('mt-2 font-playfair text-5xl font-bold', c.color)}>{c.value}</span>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/5 bg-tract-graphite p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="font-playfair text-2xl font-bold text-tract-alabaster">My Active Deals</h3>
            <div className="flex gap-2 rounded-lg bg-[#1D2023] p-1">
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
                    'rounded-md px-4 py-2 font-inter text-sm font-semibold transition-colors',
                    dealFilter === f.id ? 'bg-[#272A2E] text-tract-gold' : 'text-theme-muted hover:text-gray-200',
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
                <tr className="border-b border-[#323538]">
                  {['Property', 'Buyer', 'Current Step', 'Next Action', 'EMD', 'Advance'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'pb-4 font-inter text-xs font-bold uppercase tracking-wider text-theme-muted',
                        h === 'Advance' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-inter text-sm text-gray-200">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center font-inter text-sm text-theme-muted">
                      {allDeals.length === 0 ? 'No deals assigned to you yet.' : 'No deals match this filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredDeals.map((deal, idx) => (
                    <tr
                      key={deal.id}
                      className={cn(
                        'border-b border-white/5 transition-colors hover:bg-[#1D2023]/50',
                        idx === filteredDeals.length - 1 && 'border-b-0',
                      )}
                    >
                      <td className="py-5 font-bold">
                        <Link to={`/deals/${deal.id}`} className="text-gray-100 hover:text-tract-gold hover:underline">
                          {deal.propertyLine || '—'}
                        </Link>
                        {deal.city ? (
                          <p className="mt-0.5 font-inter text-[11px] font-normal text-theme-muted">
                            {deal.city}
                            {deal.stateCode ? `, ${deal.stateCode}` : ''}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-5 text-gray-300">{deal.buyerName}</td>
                      <td className="py-5">
                        <span className="rounded border border-[#4d4635] bg-[#1D2023] px-2 py-1 text-xs">{deal.stepLabel}</span>
                      </td>
                      <td className={cn('py-5', !deal.needsAction && 'italic text-theme-muted')}>{deal.nextAction}</td>
                      <td className="py-5 text-theme-muted">{deal.emdAmount > 0 ? formatCurrency(deal.emdAmount) : '—'}</td>
                      <td className="py-5 text-right">
                        {deal.advanceLabel ? (
                          <button
                            type="button"
                            disabled={advanceStep.isPending}
                            onClick={() => advanceStep.mutate(deal.id)}
                            className="rounded-lg bg-tract-gold px-4 py-2 font-inter text-xs font-semibold text-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                          >
                            {deal.advanceLabel}
                          </button>
                        ) : (
                          <span className="text-theme-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex gap-4 rounded-lg border-l-[3px] border-tract-rose bg-[#1D2023]/50 p-4">
            <Lock className="h-5 w-5 shrink-0 text-tract-rose" strokeWidth={2} aria-hidden />
            <p className="font-inter text-[13px] leading-snug text-tract-rose">
              You are the sole authority for pipeline steps 4 through 8. Buyers and wholesalers cannot advance these steps without your confirmation.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/5 bg-tract-graphite p-6 md:p-8">
          <h3 className="mb-6 font-playfair text-xl font-bold text-tract-alabaster">Pending EMD Confirmations</h3>

          {emds.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center gap-3">
              <BadgeCheck className="h-10 w-10 text-tract-gold" strokeWidth={1} />
              <p className="font-inter text-sm text-theme-muted">No pending EMD confirmations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emds.map((emd) => {
                const isPending = emd.emdStatus === 'pending'
                return (
                  <div
                    key={emd.dealId}
                    className={cn(
                      'flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:justify-between',
                      isPending ? 'border-white/10 bg-[#1D2023]' : 'border-white/5 bg-[#1D2023]/40 opacity-80',
                    )}
                  >
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-theme-muted">Property</p>
                        <p className="font-bold text-gray-100">{emd.propertyLine}</p>
                      </div>
                      <div>
                        <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-theme-muted">Buyer</p>
                        <p className="font-inter text-sm text-gray-300">{emd.buyerName}</p>
                      </div>
                      <div>
                        <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-theme-muted">Amount</p>
                        <p className="font-inter text-sm font-semibold tracking-wide text-tract-gold">{formatCurrency(emd.emdAmount)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span
                        className={cn(
                          'rounded-full px-4 py-1.5 font-inter text-xs font-bold',
                          isPending
                            ? 'border border-tract-gold/20 bg-tract-gold/10 text-tract-gold'
                            : 'border border-tract-green/20 bg-tract-green-light/10 text-tract-green',
                        )}
                      >
                        {isPending ? 'Pending' : 'Received ✓'}
                      </span>
                      {isPending ? (
                        <button
                          type="button"
                          disabled={confirmEmd.isPending}
                          onClick={() => confirmEmd.mutate(emd.dealId)}
                          className="rounded-lg bg-tract-gold px-4 py-2 font-inter text-sm font-semibold text-[#554300] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
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

        <div className="mt-8 flex flex-col justify-center rounded-xl border border-[#323538] bg-[#1D2023] p-6">
          <div className="mb-2 flex items-center gap-3">
            <BadgeCheck className="h-6 w-6 shrink-0 text-tract-gold" strokeWidth={2} aria-hidden />
            <h4 className="font-playfair text-xl font-bold text-gray-100">Compliance Status</h4>
          </div>
          <p className="mb-4 font-inter text-base text-theme-muted">
            Your credentials as a title representative for {company} are active and verified through {verifyYear}.
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[#323538]">
            <div className="h-full w-full bg-tract-gold" />
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
