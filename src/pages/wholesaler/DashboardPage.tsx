import { useMutation } from '@tanstack/react-query'
import {
  AlertTriangle,
  Bell,
  Clock,
  Gavel,
  Handshake,
  Loader2,
  Plus,
  ShieldCheck,
  Store,
  Zap,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import HeroBanner from '@/components/app1/HeroBanner'
import StatCard from '@/components/app1/StatCard'
import {
  useWholesalerDashboard,
  type PipelineDeal,
} from '@/hooks/useWholesaler'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

const AVATAR_FALLBACK = DEFAULT_AVATAR_IMAGE
const IMAGE_FALLBACK = DEFAULT_PROPERTY_IMAGE

export default function DashboardPage() {
  const { user } = useAuthStore()
  const proMode = useUiStore((s) => s.proMode)
  const toggleProMode = useUiStore((s) => s.toggleProMode)
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'there'

  const { data, isLoading, isError, refetch } = useWholesalerDashboard()

  const exportMutation = useMutation({
    mutationFn: async (pipeline: PipelineDeal[]) => {
      const rows = [
        ['Property', 'Status', 'Step', 'Timer'],
        ...pipeline.map((d) => [d.propertyLine, d.status, d.stepLabel, d.timerLabel]),
      ]
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'tract-deal-pipeline.csv'
      a.click()
      URL.revokeObjectURL(url)
    },
  })

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<WholesalerSidebar />}>
        <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-app1-bg-main">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" aria-label="Loading dashboard" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<WholesalerSidebar />}>
        <div className="flex min-h-[60vh] flex-1 items-center justify-center bg-app1-bg-main">
          <div className="rounded-app1-card border border-app1-danger/15 bg-app1-bg-card p-8 text-center shadow-app1-card">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-app1-danger" aria-hidden />
            <p className="mb-4 font-poppins text-sm text-app1-text-muted">Failed to load dashboard.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-secondary hover:underline"
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const payload = data
  const pipeline = payload?.pipeline ?? []
  const listings = payload?.listings ?? []

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="flex flex-1 flex-col bg-app1-bg-main">
        <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-app1-border-light bg-app1-bg-card px-6 transition-colors duration-200 md:px-12 lg:flex">
          <p className="font-poppins text-[11px] font-black uppercase tracking-[0.22em] text-app1-text-muted">
            Wholesaler Workspace
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="Notifications"
              className="relative cursor-pointer text-app1-text-muted transition-colors hover:text-app1-secondary"
            >
              <Bell className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-app1-bg-card bg-app1-danger" />
            </button>

            <div className="flex items-center gap-2 rounded-full border border-app1-border-light bg-app1-bg-soft py-0.5 pl-2 pr-1">
              <span className="font-poppins text-[10px] font-black uppercase tracking-wider text-app1-text-muted">
                {proMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={proMode}
                aria-label="Toggle Pro Mode"
                onClick={toggleProMode}
                className={cn(
                  'relative h-4 w-8 rounded-full transition-colors',
                  proMode ? 'bg-app1-secondary' : 'bg-gray-400',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-3 w-3 rounded-full bg-app1-primary-dark transition-all',
                    proMode ? 'right-0.5' : 'left-0.5',
                  )}
                />
              </button>
            </div>

            <div className="h-9 w-9 overflow-hidden rounded-full border border-app1-border-light bg-app1-bg-soft">
              <img src={AVATAR_FALLBACK} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <div className="mx-auto flex-1 max-w-[1440px] space-y-8 p-6 md:p-12">
          <HeroBanner
            eyebrow="Wholesaler Pro Mode"
            title={`${greeting}, ${firstName}. Let's move your next deal.`}
            description="Manage active assignments, track your marketing clock, and publish new listings — all from one focused workspace."
            badgeText="Live pipeline metrics"
            actions={
              <Link
                to="/wholesaler/listings/new"
                className="inline-flex items-center gap-2 bg-app1-secondary px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-app1-primary-dark shadow-app1-premium transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Create New Listing
              </Link>
            }
          />

          {payload?.killSwitch ? (
            <section className="flex flex-col gap-4 rounded-app1-card border border-app1-danger/30 bg-app1-danger/5 p-5 shadow-app1-card sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app1-danger">
                  <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h4 className="font-poppins text-sm font-black uppercase tracking-wide text-app1-text-main">
                    {payload.killSwitch.headline}
                  </h4>
                  <p className="font-poppins text-sm text-app1-text-muted">{payload.killSwitch.detailLine}</p>
                  <p
                    className={cn(
                      'mt-1 font-poppins text-sm font-bold',
                      payload.killSwitch.hoursLeft < 12 ? 'animate-pulse text-app1-danger' : 'text-app1-danger',
                    )}
                  >
                    {payload.killSwitch.timerLabel}
                  </p>
                </div>
              </div>
              <Link
                to={`/deals/${payload.killSwitch.dealId}`}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-app1-danger px-6 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-700"
              >
                Upload Proof Now
              </Link>
            </section>
          ) : null}

          <section className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-5">
            <StatCard
              label="Active Deals"
              value={payload?.stats.activeDeals ?? 0}
              note="In your pipeline"
              icon={Handshake}
              tone="primary"
            />
            <StatCard
              label="My Listings"
              value={payload?.stats.myListings ?? 0}
              note="Total published"
              icon={Store}
              tone="neutral"
            />
            <StatCard
              label="Bids Received"
              value={payload?.stats.totalBidsReceived ?? 0}
              note="Across all listings"
              icon={Gavel}
              tone="neutral"
            />
            <StatCard
              label="Reliability Score"
              value={payload?.stats.reliabilityScore ?? 100}
              note={payload?.stats.reliabilityTier ?? 'Elite'}
              icon={ShieldCheck}
              tone="primary"
              featured
            />
            <StatCard
              label="Kill Switch Alert"
              value={payload?.stats.killSwitchAlerts ?? 0}
              note="Needs your attention"
              icon={AlertTriangle}
              tone="danger"
            />
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-cinzel text-2xl font-black text-app1-primary">Deal Pipeline</h3>
                <p className="mt-1 text-sm text-app1-text-muted">Track signatures, deadlines and next actions.</p>
              </div>
              <button
                type="button"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate(pipeline)}
                className="rounded-xl border border-app1-border-light bg-app1-bg-card px-4 py-2.5 font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-app1-text-muted transition-colors hover:border-app1-secondary hover:text-app1-secondary disabled:opacity-50"
              >
                {exportMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    Exporting…
                  </span>
                ) : (
                  'Export CSV'
                )}
              </button>
            </div>

            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead className="bg-app1-bg-soft">
                    <tr>
                      {['Property', 'Progress', 'Timer', 'Action'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-4 font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-app1-text-muted',
                            h === 'Action' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app1-border-light">
                    {pipeline.map((deal) => (
                      <tr
                        key={deal.id}
                        className={cn(
                          'transition-colors duration-200 hover:bg-app1-bg-soft/60',
                          deal.status === 'action_required' && 'bg-app1-danger/5',
                        )}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-app1-bg-soft">
                              <img
                                src={deal.imageUrl || IMAGE_FALLBACK}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-poppins text-sm font-black text-app1-primary">{deal.propertyLine}</p>
                              <p className="font-poppins text-xs text-app1-text-muted">{deal.portfolioRef}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'font-poppins text-sm font-bold',
                              deal.status === 'action_required' ? 'text-app1-danger' : 'text-app1-primary',
                            )}
                          >
                            {deal.stepLabel}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div
                            className={cn(
                              'flex items-center gap-1.5 font-poppins text-sm',
                              deal.timerTone === 'green' ? 'font-bold text-app1-primary' : 'font-black text-app1-danger',
                              deal.timerPulse && 'animate-pulse',
                            )}
                          >
                            {deal.timerTone === 'green' ? (
                              <Clock className="h-4 w-4 shrink-0" aria-hidden />
                            ) : (
                              <Zap className="h-4 w-4 shrink-0" aria-hidden />
                            )}
                            {deal.timerLabel}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {deal.primaryAction === 'upload' ? (
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-danger hover:underline"
                            >
                              Upload Proof
                            </Link>
                          ) : (
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline"
                            >
                              View Deal
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-cinzel text-2xl font-black text-app1-primary">Active Marketplace Listings</h3>
                <p className="mt-1 text-sm text-app1-text-muted">Live and draft assignments you're managing.</p>
              </div>
              <Link
                to="/wholesaler/listings/new"
                className="inline-flex items-center gap-2 bg-app1-secondary px-6 py-3 font-poppins text-[10px] font-black uppercase tracking-[0.2em] text-app1-primary-dark shadow-app1-premium transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                Create New Listing
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-40 overflow-hidden bg-app1-bg-soft">
                    <img
                      src={listing.imageUrl || IMAGE_FALLBACK}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                      {listing.status === 'live'
                        ? `Live • ${listing.bidCount} Bids`
                        : listing.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="mb-1 font-poppins text-base font-black text-app1-primary">{listing.address}</h4>
                    <p className="mb-4 font-poppins text-sm text-app1-text-muted">
                      {listing.city}
                      {listing.stateCode ? `, ${listing.stateCode}` : ''}
                    </p>
                    <div className="mb-4 flex justify-between">
                      <div>
                        <span className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">
                          ARV
                        </span>
                        <p className="font-poppins text-sm font-black text-app1-secondary">{formatCurrency(listing.arv)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">
                          Market Price
                        </span>
                        <p className="font-poppins text-sm font-black text-app1-primary">
                          {formatCurrency(listing.assignmentFeeHigh)}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-app1-border-light" />
                    <div className="pt-4">
                      {listing.status === 'live' ? (
                        <Link
                          to={`/wholesaler/listings/${listing.id}`}
                          className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline"
                        >
                          View Bids
                        </Link>
                      ) : (
                        <Link
                          to={`/wholesaler/listings/new?from=${listing.id}`}
                          className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-primary hover:underline"
                        >
                          Edit Draft
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-auto border-t border-app1-border-light bg-app1-bg-soft">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row md:px-12">
            <div>
              <span className="font-cinzel text-[20px] font-black text-app1-primary">TRACT</span>
              <p className="mt-2 font-poppins text-sm text-app1-text-muted">
                © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6">
              {[
                { label: 'Terms of Service', href: '/legal/terms' },
                { label: 'Privacy Policy', href: '/legal/privacy' },
                { label: 'NDA', href: '/legal/nda' },
                { label: 'Legal Notices', href: '/legal/terms' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  )
}
