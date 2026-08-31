import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Gavel,
  Handshake,
  Loader2,
  Plus,
  Star,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import HeroBanner from '@/components/app1/HeroBanner'
import StatCard from '@/components/app1/StatCard'
import SellerTractBidsSection from '@/components/shared/SellerTractBidsSection'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency, userFirstName } from '@/lib/utils'
import { useBuyerDashboard } from '@/hooks/useBuyer'

const FALLBACK_IMAGE = DEFAULT_PROPERTY_IMAGE

const BID_STATUS_STYLE: Record<string, string> = {
  active: 'bg-blue-50 text-blue-600',
  primary: 'bg-app1-secondary/10 text-app1-secondary',
  backup_2: 'bg-app1-primary/10 text-app1-primary',
  backup_3: 'bg-app1-primary/10 text-app1-primary',
  working: 'bg-app1-bg-soft text-app1-text-muted',
  rejected: 'bg-app1-danger/10 text-app1-danger',
}

const DEAL_TYPE_LABEL: Record<string, string> = {
  fix_flip: 'Fix & Flip',
  hold_sell: 'Hold & Sell',
  full_gut: 'Full Gut',
  new_construction: 'New Construction',
}

export default function BuyerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = userFirstName(user)

  const { data, isLoading, isError, refetch } = useBuyerDashboard()

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<Sidebar />}>
        <div className="flex min-h-screen items-center justify-center bg-app1-bg-main">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<Sidebar />}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-app1-bg-main gap-4">
          <AlertTriangle className="h-10 w-10 text-app1-danger" />
          <p className="font-poppins text-app1-text-muted">Failed to load dashboard.</p>
          <button
            type="button"
            onClick={() => {
              void refetch()
            }}
            className="font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-secondary hover:underline"
          >
            Try again
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const stats = data?.stats
  const bids = data?.activeBids ?? []
  const deals = data?.activeDeals ?? []
  const recommended = data?.recommendedListings ?? []
  const app1Bids = data?.app1Bids ?? []

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] p-6 md:p-10 space-y-8">

          {/* Hero banner */}
          <HeroBanner
            eyebrow="Buyer Workspace"
            title={firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
            description="Track your active bids, monitor deals in progress, and discover new institutional-grade opportunities — all in one place."
            badgeText="Live buyer metrics"
            actions={
              <Link
                to="/buyer/marketplace"
                className="inline-flex items-center gap-2 bg-app1-secondary px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-app1-primary-dark shadow-app1-premium rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Browse Listings
              </Link>
            }
          />

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            <StatCard
              label="Active Bids"
              value={stats?.activeBids ?? 0}
              note="Awaiting decision"
              icon={Gavel}
              tone="neutral"
              path="/buyer/bids"
            />
            <StatCard
              label="Deals In Progress"
              value={stats?.dealsInProgress ?? 0}
              note="Currently tracking"
              icon={Handshake}
              tone="primary"
              path="/buyer/deals"
            />
            <StatCard
              label="Deals Closed"
              value={stats?.dealsClosed ?? 0}
              note="All time"
              icon={CheckCircle2}
              tone="primary"
              path="/buyer/history"
            />
            <StatCard
              label="Reliability Score"
              value={stats?.reliabilityScore ?? 100}
              note={stats?.reliabilityTier ?? 'Elite'}
              icon={Star}
              tone="neutral"
              featured
              path="/buyer/profile"
            />
          </div>

          {/* Vetted buyer badge */}
          {stats?.isVettedBuyer && (
            <div className="flex items-center gap-3.5 rounded-app1-card bg-gradient-to-r from-app1-primary/10 via-app1-primary/5 to-transparent border border-app1-primary/20 p-5 shadow-app1-card transition-all duration-300">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app1-primary/15 text-app1-primary shadow-sm">
                <BadgeCheck className="h-6 w-6" strokeWidth={2} />
              </div>
              <p className="font-poppins text-[14px] font-bold text-app1-primary">
                Vetted Buyer — You have priority access to new listings.
              </p>
            </div>
          )}

          {/* Buyer Tract bids + Seller Tract bids */}
          <div className="rounded-app1-card bg-app1-bg-card/90 backdrop-blur-sm border border-app1-border-light shadow-app1-card overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="px-6 py-5 border-b border-app1-border-light flex items-center justify-between bg-gradient-to-r from-app1-bg-card to-app1-bg-soft/50">
              <h2 className="font-cinzel text-xl font-black text-app1-primary">Buyer Tract Bids</h2>
              <Link
                to="/buyer/bids"
                className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline flex items-center gap-1 transition-transform duration-200 hover:translate-x-0.5"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {bids.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Gavel className="h-10 w-10 text-app1-border-light mx-auto mb-3" strokeWidth={1} />
                <p className="font-poppins text-app1-text-muted text-[14px] mb-4">No active bids yet.</p>
                <Link
                  to="/buyer/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl border border-app1-border-light bg-app1-bg-soft px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:border-app1-secondary/50 hover:bg-app1-bg-card transition-all"
                >
                  Browse marketplace →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr className="bg-app1-bg-soft/70 border-b border-app1-border-light">
                      {['Property', 'Bid Price', 'Status', 'Submitted', 'Action'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-3.5 font-poppins text-[10px]',
                            'font-black uppercase tracking-[0.16em]',
                            'text-app1-text-muted text-left',
                            h === 'Action' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app1-border-light">
                    {bids.map((bid) => (
                      <tr key={bid.id} className="hover:bg-app1-secondary/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={bid.imageUrl || FALLBACK_IMAGE}
                              alt=""
                              className="h-10 w-14 rounded-lg object-cover shrink-0 shadow-sm"
                            />
                            <div>
                              <p className="font-poppins text-[13px] font-black text-app1-primary">
                                {bid.propertyLine || '—'}
                              </p>
                              <p className="font-poppins text-[11px] text-app1-text-muted">
                                {bid.city}
                                {bid.stateCode ? `, ${bid.stateCode}` : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-poppins text-[14px] font-black text-app1-secondary">
                            {formatCurrency(bid.assignmentPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-block rounded-full',
                              'px-3 py-1 font-poppins',
                              'text-[10px] font-black',
                              'uppercase tracking-[0.14em]',
                              BID_STATUS_STYLE[bid.status] ?? 'bg-app1-bg-soft text-app1-text-muted',
                            )}
                          >
                            {bid.statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-poppins text-[12px] text-app1-text-muted">
                          {new Date(bid.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {bid.action === 'deal' && bid.dealId ? (
                            <Link
                              to={`/deals/${bid.dealId}`}
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary hover:text-app1-secondary hover:underline transition-colors"
                            >
                              View Deal
                            </Link>
                          ) : (
                            <Link
                              to={`/buyer/listings/${bid.listingId}`}
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline transition-colors"
                            >
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <SellerTractBidsSection bids={app1Bids} />

          {/* Deals in progress */}
          {deals.length > 0 && (
            <div className="rounded-app1-card bg-app1-bg-card/90 backdrop-blur-sm border border-app1-border-light shadow-app1-card overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="px-6 py-5 border-b border-app1-border-light bg-gradient-to-r from-app1-bg-card to-app1-bg-soft/50">
                <h2 className="font-cinzel text-xl font-black text-app1-primary">Deals In Progress</h2>
              </div>
              <div className="divide-y divide-app1-border-light">
                {deals.map((deal) => {
                  const pct = Math.round((deal.stepNumber / deal.totalSteps) * 100)
                  return (
                    <div
                      key={deal.id}
                      className="px-6 py-5 flex items-center gap-4 flex-wrap md:flex-nowrap transition-colors duration-200 hover:bg-app1-secondary/5"
                    >
                      <img
                        src={deal.imageUrl || FALLBACK_IMAGE}
                        alt=""
                        className="h-14 w-20 rounded-xl object-cover shrink-0 shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins text-[14px] font-black text-app1-primary truncate">
                          {deal.propertyLine || '—'}
                        </p>
                        <p className="font-poppins text-[12px] text-app1-text-muted mt-0.5">with {deal.wholesalerName}</p>
                        <div className="mt-2.5 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-app1-border-light/80 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-app1-primary to-app1-secondary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-poppins text-[11px] font-bold text-app1-text-muted shrink-0">
                            Step {deal.stepNumber}/{deal.totalSteps}
                          </span>
                        </div>
                        <p className="font-poppins text-[12px] text-app1-primary font-bold mt-1">{deal.stepLabel}</p>
                      </div>
                      <Link
                        to={`/deals/${deal.id}`}
                        className="shrink-0 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline flex items-center gap-1 transition-transform duration-200 hover:translate-x-0.5"
                      >
                        Track Deal
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommended listings */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-cinzel text-2xl font-black text-app1-primary">Recommended For You</h2>
                <p className="mt-1 font-poppins text-xs text-app1-text-muted">High-yield verified properties matching your criteria</p>
              </div>
              <Link
                to="/buyer/marketplace"
                className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline flex items-center gap-1 transition-transform duration-200 hover:translate-x-0.5"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recommended.length === 0 ? (
              <div className="rounded-app1-card bg-app1-bg-card/90 backdrop-blur-sm border border-app1-border-light p-12 text-center shadow-app1-card">
                <TrendingUp className="h-10 w-10 text-app1-border-light mx-auto mb-3" strokeWidth={1} />
                <p className="font-poppins text-app1-text-muted text-[14px] mb-4">No listings available right now.</p>
                <Link
                  to="/buyer/marketplace"
                  className="inline-flex items-center gap-2 rounded-xl border border-app1-border-light bg-app1-bg-soft px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:border-app1-secondary/50 hover:bg-app1-bg-card transition-all"
                >
                  Browse all listings →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {recommended.map((listing) => {
                  const pct = Math.round((listing.bidCount / 10) * 100)
                  const typeLabel = DEAL_TYPE_LABEL[listing.dealType] ?? listing.dealType

                  return (
                    <Link
                      key={listing.id}
                      to={`/buyer/listings/${listing.id}`}
                      className="group rounded-app1-card bg-app1-bg-card/90 backdrop-blur-sm border border-app1-border-light overflow-hidden shadow-app1-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-app1-secondary/40 flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-44 overflow-hidden bg-app1-bg-soft">
                          <img
                            src={listing.imageUrl || FALLBACK_IMAGE}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          <span className="absolute left-3 top-3 bg-app1-primary-dark/85 text-white font-poppins text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                            {typeLabel}
                          </span>
                        </div>
                        <div className="p-5">
                          <p className="font-poppins text-[14px] font-black text-app1-primary truncate group-hover:text-app1-secondary transition-colors">
                            {listing.propertyAddress}
                          </p>
                          <p className="font-poppins text-[11px] text-app1-text-muted mt-0.5">
                            {listing.city}
                            {listing.stateCode ? `, ${listing.stateCode}` : ''}
                          </p>
                          <div className="mt-4 rounded-xl bg-app1-bg-soft/70 border border-app1-border-light/60 p-3">
                            <p className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">Projected Profit</p>
                            <p className="font-cinzel text-[22px] font-black text-app1-secondary leading-tight mt-0.5">
                              {formatCurrency(listing.projectedBuyerProfit)}
                            </p>
                          </div>
                          <div className="mt-3.5 space-y-1.5">
                            <div className="flex justify-between font-poppins text-[11px] font-black uppercase tracking-wide">
                              <span className="text-app1-text-muted">{listing.bidCount}/10 bids</span>
                              <span className="text-app1-secondary font-bold">{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-app1-border-light overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-app1-primary to-app1-secondary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-1">
                        <span className="flex h-11 w-full items-center justify-center rounded-xl bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-sm transition-all duration-200 group-hover:bg-amber-400 group-hover:shadow-md active:scale-98">
                          Place Bid
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
