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
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'
import { useBuyerDashboard } from '@/hooks/useBuyer'
import TopBar from '@/components/layout/TopBar'

const FALLBACK_IMAGE = DEFAULT_PROPERTY_IMAGE

const BID_STATUS_STYLE: Record<string, string> = {
  active: 'bg-blue-50 text-blue-600',
  primary: 'bg-tract-gold/10 text-tract-gold',
  backup_2: 'bg-tract-green-light text-tract-green',
  backup_3: 'bg-tract-green-light text-tract-green',
  working: 'bg-theme-surface-2 text-theme-muted',
  rejected: 'bg-tract-red-light text-tract-red',
}

const DEAL_TYPE_LABEL: Record<string, string> = {
  fix_flip: 'Fix & Flip',
  hold_sell: 'Hold & Sell',
  full_gut: 'Full Gut',
  new_construction: 'New Construction',
}

export default function BuyerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? 'Jordan'

  const { data, isLoading, isError, refetch } = useBuyerDashboard()

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<Sidebar />}>
        <div className="flex min-h-screen items-center justify-center bg-theme-bg">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<Sidebar />}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-theme-bg gap-4">
          <AlertTriangle className="h-10 w-10 text-tract-red" />
          <p className="font-inter text-theme-muted">Failed to load dashboard.</p>
          <button
            type="button"
            onClick={() => {
              void refetch()
            }}
            className="font-inter text-sm font-bold uppercase tracking-wider text-tract-gold hover:underline"
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

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar
          title={`Welcome back, ${firstName}`}
          actions={
            <Link
              to="/buyer/marketplace"
              className="inline-flex items-center gap-2 bg-tract-gold px-4 py-2 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white hover:bg-yellow-600 transition-all"
            >
              <Plus className="h-4 w-4" />
              Browse Listings
            </Link>
          }
        />

        <div className="mx-auto max-w-[1440px] p-6 md:p-10 space-y-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
            <div className="rounded-[12px] bg-theme-card border border-theme-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                  Active Bids
                </p>
                <Gavel className="h-5 w-5 text-tract-gold" strokeWidth={1.75} />
              </div>
              <p className="font-playfair text-[40px] font-bold text-tract-gold leading-none">
                {stats?.activeBids ?? 0}
              </p>
            </div>

            <div className="rounded-[12px] bg-theme-card border border-theme-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                  Deals In Progress
                </p>
                <Handshake className="h-5 w-5 text-tract-green" strokeWidth={1.75} />
              </div>
              <p className="font-playfair text-[40px] font-bold text-theme-text leading-none">
                {stats?.dealsInProgress ?? 0}
              </p>
            </div>

            <div className="rounded-[12px] bg-theme-card border border-theme-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                  Deals Closed
                </p>
                <CheckCircle2 className="h-5 w-5 text-tract-green" strokeWidth={1.75} />
              </div>
              <p className="font-playfair text-[40px] font-bold text-tract-green leading-none">
                {stats?.dealsClosed ?? 0}
              </p>
            </div>

            <div className="rounded-[12px] bg-theme-card border border-theme-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                  Reliability Score
                </p>
                <Star className="h-5 w-5 text-tract-gold" strokeWidth={1.75} />
              </div>
              <p className="font-playfair text-[40px] font-bold text-theme-text leading-none">
                {stats?.reliabilityScore ?? 100}
              </p>
              <p className="font-inter text-[11px] text-theme-muted mt-1">{stats?.reliabilityTier ?? 'Elite'}</p>
            </div>
          </div>

          {stats?.isVettedBuyer && (
            <div className="flex items-center gap-3 rounded-[12px] bg-tract-green-light border border-tract-green/20 p-4">
              <BadgeCheck className="h-6 w-6 text-tract-green shrink-0" strokeWidth={1.75} />
              <p className="font-inter text-[14px] font-semibold text-tract-green">
                Vetted Buyer — You have priority access to new listings.
              </p>
            </div>
          )}

          <div className="rounded-[12px] bg-theme-card border border-theme-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-theme-border flex items-center justify-between">
              <h2 className="font-playfair text-[20px] font-bold text-theme-text">Active Bids</h2>
              <Link
                to="/buyer/bids"
                className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {bids.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Gavel className="h-10 w-10 text-gray-200 mx-auto mb-3" strokeWidth={1} />
                <p className="font-inter text-theme-muted text-[14px] mb-4">No active bids yet.</p>
                <Link
                  to="/buyer/marketplace"
                  className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                >
                  Browse marketplace →
                </Link>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-theme-surface-2 border-b border-theme-border">
                    {['Property', 'Bid Price', 'Status', 'Submitted', 'Action'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-3 font-inter text-[11px]',
                          'font-bold uppercase tracking-wider',
                          'text-theme-muted text-left',
                          h === 'Action' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {bids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-theme-surface-2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={bid.imageUrl || FALLBACK_IMAGE}
                            alt=""
                            className="h-10 w-14 rounded object-cover shrink-0"
                          />
                          <div>
                            <p className="font-inter text-[13px] font-bold text-theme-text">
                              {bid.propertyLine || '—'}
                            </p>
                            <p className="font-inter text-[11px] text-theme-muted">
                              {bid.city}
                              {bid.stateCode ? `, ${bid.stateCode}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-inter text-[14px] font-bold text-tract-gold">
                          {formatCurrency(bid.assignmentPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-block rounded-full',
                            'px-3 py-1 font-inter',
                            'text-[11px] font-bold',
                            'uppercase tracking-wider',
                            BID_STATUS_STYLE[bid.status] ?? 'bg-theme-surface-2 text-theme-muted',
                          )}
                        >
                          {bid.statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-inter text-[12px] text-theme-muted">
                        {new Date(bid.submittedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {bid.action === 'deal' && bid.dealId ? (
                          <Link
                            to={`/deals/${bid.dealId}`}
                            className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-green hover:underline"
                          >
                            View Deal
                          </Link>
                        ) : (
                          <Link
                            to={`/buyer/listings/${bid.listingId}`}
                            className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {deals.length > 0 && (
            <div className="rounded-[12px] bg-theme-card border border-theme-border shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-theme-border">
                <h2 className="font-playfair text-[20px] font-bold text-theme-text">Deals In Progress</h2>
              </div>
              <div className="divide-y divide-theme-border">
                {deals.map((deal) => {
                  const pct = Math.round((deal.stepNumber / deal.totalSteps) * 100)
                  return (
                    <div
                      key={deal.id}
                      className="px-6 py-5 flex items-center gap-4 flex-wrap md:flex-nowrap"
                    >
                      <img
                        src={deal.imageUrl || FALLBACK_IMAGE}
                        alt=""
                        className="h-14 w-20 rounded object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-inter text-[14px] font-bold text-theme-text truncate">
                          {deal.propertyLine || '—'}
                        </p>
                        <p className="font-inter text-[12px] text-theme-muted mt-0.5">with {deal.wholesalerName}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full bg-tract-green rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-inter text-[11px] text-theme-muted shrink-0">
                            Step {deal.stepNumber}/{deal.totalSteps}
                          </span>
                        </div>
                        <p className="font-inter text-[12px] text-tract-green font-semibold mt-1">{deal.stepLabel}</p>
                      </div>
                      <Link
                        to={`/deals/${deal.id}`}
                        className="shrink-0 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline flex items-center gap-1"
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

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-playfair text-[24px] font-bold text-theme-text">Recommended For You</h2>
              <Link
                to="/buyer/marketplace"
                className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recommended.length === 0 ? (
              <div className="rounded-[12px] bg-theme-card border border-theme-border p-12 text-center">
                <TrendingUp className="h-10 w-10 text-gray-200 mx-auto mb-3" strokeWidth={1} />
                <p className="font-inter text-theme-muted text-[14px] mb-4">No listings available right now.</p>
                <Link
                  to="/buyer/marketplace"
                  className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                >
                  Browse all listings →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {recommended.map((listing) => {
                  const pct = Math.round((listing.bidCount / 10) * 100)
                  const typeLabel = DEAL_TYPE_LABEL[listing.dealType] ?? listing.dealType

                  return (
                    <div
                      key={listing.id}
                      className="rounded-[12px] bg-theme-card border border-theme-border overflow-hidden shadow-sm hover:border-tract-gold/60 transition-all duration-300 hover:scale-[1.02] group"
                    >
                      <div className="relative h-[140px]">
                        <img
                          src={listing.imageUrl || FALLBACK_IMAGE}
                          alt=""
                          className="h-full w-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                        />
                        <span className="absolute left-2 top-2 bg-tract-green text-white font-inter text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm">
                          {typeLabel}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="font-inter text-[13px] font-bold text-theme-text truncate">
                          {listing.propertyAddress}
                        </p>
                        <p className="font-inter text-[11px] text-theme-muted mt-0.5">
                          {listing.city}
                          {listing.stateCode ? `, ${listing.stateCode}` : ''}
                        </p>
                        <div className="mt-3">
                          <p className="font-inter text-[10px] font-bold uppercase text-theme-muted">Projected Profit</p>
                          <p className="font-playfair text-[22px] font-bold text-tract-gold">
                            {formatCurrency(listing.projectedBuyerProfit)}
                          </p>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between font-inter text-[11px] font-bold uppercase tracking-wide">
                            <span className="text-theme-muted">{listing.bidCount}/10 bids</span>
                            <span className="text-tract-gold">{pct}%</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full bg-tract-gold rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <Link
                          to={`/buyer/listings/${listing.id}`}
                          className="mt-3 flex h-9 w-full items-center justify-center bg-tract-gold font-inter text-[11px] font-bold uppercase tracking-wider text-white hover:bg-yellow-500 transition-colors"
                        >
                          Place Bid
                        </Link>
                      </div>
                    </div>
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
