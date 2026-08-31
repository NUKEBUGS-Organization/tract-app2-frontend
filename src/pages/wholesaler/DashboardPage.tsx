import { useMutation } from '@tanstack/react-query'
import {
  AlertTriangle,
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
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import HeroBanner from '@/components/app1/HeroBanner'
import StatCard from '@/components/app1/StatCard'
import SellerTractBidsSection from '@/components/shared/SellerTractBidsSection'
import DealPipelineStepDots from '@/components/deals/DealPipelineStepDots'
import {
  useWholesalerDashboard,
  type PipelineDeal,
} from '@/hooks/useWholesaler'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency, userFirstName } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const IMAGE_FALLBACK = DEFAULT_PROPERTY_IMAGE

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const firstName = userFirstName(user)

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
  const app1Bids = payload?.app1Bids ?? []

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="flex flex-1 flex-col bg-app1-bg-main">
        <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-8 p-6 md:p-12">
          <HeroBanner
            eyebrow="Wholesaler Pro Mode"
            title={
              firstName
                ? `${greeting}, ${firstName}. Let's move your next deal.`
                : `${greeting}. Let's move your next deal.`
            }
            description="Manage active assignments, track your marketing clock, and publish new listings — all from one focused workspace."
            badgeText="Live pipeline metrics"
            actions={
              <Link
                to="/wholesaler/listings/new"
                className="inline-flex items-center gap-2 bg-app1-secondary px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-app1-primary-dark shadow-app1-premium rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Create New Listing
              </Link>
            }
          />

          {payload?.killSwitch ? (
            <section className="flex flex-col gap-4 rounded-app1-card border border-app1-danger/30 bg-gradient-to-r from-app1-danger/10 via-app1-danger/5 to-transparent p-5 shadow-app1-card transition-all duration-300 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-app1-danger shadow-md shadow-app1-danger/20">
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
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-app1-danger px-6 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md active:scale-98"
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
              path="/wholesaler/deals"
            />
            <StatCard
              label="My Listings"
              value={payload?.stats.myListings ?? 0}
              note="Total published"
              icon={Store}
              tone="neutral"
              path="/wholesaler/listings"
            />
            <StatCard
              label="Bids Received"
              value={payload?.stats.totalBidsReceived ?? 0}
              note="Across all listings"
              icon={Gavel}
              tone="neutral"
              path="/wholesaler/bids"
            />
            <StatCard
              label="Reliability Score"
              value={payload?.stats.reliabilityScore ?? 100}
              note={payload?.stats.reliabilityTier ?? 'Elite'}
              icon={ShieldCheck}
              tone="primary"
              noteAsPill
              path="/wholesaler/score"
            />
            <StatCard
              label="Kill Switch Alert"
              value={payload?.stats.killSwitchAlerts ?? 0}
              note="Needs your attention"
              icon={AlertTriangle}
              tone="danger"
              path={
                payload?.killSwitch?.dealId
                  ? `/deals/${payload.killSwitch.dealId}`
                  : '/wholesaler/deals'
              }
            />
          </section>

          <SellerTractBidsSection bids={app1Bids} />

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-cinzel text-2xl font-black text-app1-primary">Deal Pipeline</h3>
                <p className="mt-1 font-poppins text-sm text-app1-text-muted">Track signatures, deadlines and next actions.</p>
              </div>
              <button
                type="button"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate(pipeline)}
                className="rounded-xl border border-app1-border-light bg-app1-bg-card/90 px-4 py-2.5 font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-app1-text-muted shadow-sm transition-all duration-200 hover:border-app1-secondary hover:text-app1-secondary hover:shadow-md disabled:opacity-50 active:scale-98"
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

            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card/90 backdrop-blur-sm shadow-app1-card transition-all duration-300 hover:shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead className="bg-gradient-to-r from-app1-bg-soft to-app1-bg-soft/50 border-b border-app1-border-light">
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
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate(`/deals/${deal.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate(`/deals/${deal.id}`)
                          }
                        }}
                        className={cn(
                          'cursor-pointer transition-colors duration-200 hover:bg-app1-secondary/5',
                          deal.status === 'action_required' && 'bg-app1-danger/5',
                        )}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-app1-bg-soft shadow-sm">
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
                          <DealPipelineStepDots currentStep={deal.currentStep} />
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
                        <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
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
                <p className="mt-1 font-poppins text-sm text-app1-text-muted">Live and draft assignments you're managing.</p>
              </div>
              <Link
                to="/wholesaler/listings/new"
                className="inline-flex items-center gap-2 bg-app1-secondary px-6 py-3 font-poppins text-[10px] font-black uppercase tracking-[0.2em] text-app1-primary-dark shadow-app1-premium rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                Create New Listing
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => {
                const target =
                  listing.status === 'live'
                    ? `/wholesaler/listings/${listing.id}`
                    : `/wholesaler/listings/new?from=${listing.id}`
                return (
                <Link
                  key={listing.id}
                  to={target}
                  className="group overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card/90 backdrop-blur-sm shadow-app1-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-app1-secondary/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden bg-app1-bg-soft">
                      <img
                        src={listing.imageUrl || IMAGE_FALLBACK}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                      <div className="absolute left-4 top-4 rounded-full bg-black/60 border border-white/10 px-3.5 py-1 font-poppins text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-md shadow-sm">
                        {listing.status === 'live'
                          ? `Live • ${listing.bidCount} Bids`
                          : listing.status.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="mb-1 font-poppins text-base font-black text-app1-primary group-hover:text-app1-secondary transition-colors">{listing.address}</h4>
                      <p className="mb-4 font-poppins text-sm text-app1-text-muted">
                        {listing.city}
                        {listing.stateCode ? `, ${listing.stateCode}` : ''}
                      </p>
                      <div className="mb-4 flex justify-between rounded-xl bg-app1-bg-soft/70 border border-app1-border-light/60 p-3">
                        <div>
                          <span className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">
                            ARV
                          </span>
                          <p className="font-poppins text-base font-black text-app1-secondary">{formatCurrency(listing.arv)}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">
                            Market Price
                          </span>
                          <p className="font-poppins text-base font-black text-app1-primary">
                            {formatCurrency(listing.assignmentFeeHigh)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0">
                    <span className="flex h-11 w-full items-center justify-center rounded-xl bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-primary-dark shadow-sm transition-all duration-200 group-hover:bg-amber-400 group-hover:shadow-md active:scale-98">
                      {listing.status === 'live' ? 'View Bids' : 'Edit Draft'}
                    </span>
                  </div>
                </Link>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
