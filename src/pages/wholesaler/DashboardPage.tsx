import { useMutation } from '@tanstack/react-query'
import {
  AlertTriangle,
  Bell,
  Clock,
  Loader2,
  Plus,
  PlusCircle,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import {
  useWholesalerDashboard,
  type PipelineDeal,
} from '@/hooks/useWholesaler'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const AVATAR_FALLBACK = DEFAULT_AVATAR_IMAGE
const IMAGE_FALLBACK = DEFAULT_PROPERTY_IMAGE

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [proMode, setProMode] = useState(true)
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Marcus'

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
      <div className="flex min-h-screen bg-tract-alabaster font-inter text-tract-obsidian">
        <WholesalerSidebar />
        <main className="ml-[240px] flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" aria-label="Loading dashboard" />
        </main>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-screen bg-tract-alabaster font-inter text-tract-obsidian">
        <WholesalerSidebar />
        <main className="ml-[240px] flex flex-1 items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-tract-red" aria-hidden />
            <p className="mb-4 font-inter text-gray-500">Failed to load dashboard.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-inter text-sm font-bold uppercase tracking-wider text-tract-gold hover:underline"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    )
  }

  const payload = data
  const pipeline = payload?.pipeline ?? []
  const listings = payload?.listings ?? []

  return (
    <div className="flex min-h-screen bg-tract-alabaster font-inter text-tract-obsidian">
      <WholesalerSidebar />

      <main className="ml-[240px] min-h-screen flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 md:px-12">
          <h2 className="font-playfair text-[24px] font-bold text-tract-obsidian">
            {greeting}, {firstName}.
          </h2>
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="Notifications"
              className="relative cursor-pointer text-gray-400 transition-colors hover:text-tract-gold"
            >
              <Bell className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-tract-red" />
            </button>

            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-0.5 pl-2 pr-1">
              <span className="font-inter text-[10px] font-bold uppercase text-tract-gold">Pro Mode</span>
              <button
                type="button"
                role="switch"
                aria-checked={proMode}
                aria-label="Toggle Pro Mode"
                onClick={() => setProMode((v) => !v)}
                className={cn(
                  'relative h-4 w-8 rounded-full transition-colors',
                  proMode ? 'bg-tract-gold' : 'bg-gray-600',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-3 w-3 rounded-full bg-[#3c2f00] transition-all',
                    proMode ? 'right-0.5' : 'left-0.5',
                  )}
                />
              </button>
            </div>

            <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              <img src={AVATAR_FALLBACK} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-6 p-6 md:p-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
            <div className="group cursor-default border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-tract-gold">
              <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Active Deals
              </p>
              <p className="font-playfair text-[48px] font-bold leading-none text-tract-gold">
                {payload?.stats.activeDeals ?? 0}
              </p>
            </div>
            <div className="group cursor-default border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-tract-gold">
              <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                My Listings
              </p>
              <p className="font-playfair text-[48px] font-bold leading-none text-tract-obsidian">
                {payload?.stats.myListings ?? 0}
              </p>
            </div>
            <div className="group cursor-default border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-tract-gold">
              <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Bids Received
              </p>
              <p className="font-playfair text-[48px] font-bold leading-none text-tract-obsidian">
                {payload?.stats.totalBidsReceived ?? 0}
              </p>
            </div>
            <div className="group cursor-default border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-tract-gold">
              <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Reliability Score
              </p>
              <div className="flex items-baseline gap-2">
                <p className="font-playfair text-[48px] font-bold leading-none text-tract-green">
                  {payload?.stats.reliabilityScore ?? 100}
                </p>
                <span className="font-inter text-xs font-bold uppercase text-tract-green-light">
                  {payload?.stats.reliabilityTier ?? 'Elite'}
                </span>
              </div>
            </div>
            <div className="group cursor-default border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-tract-red sm:col-span-2 xl:col-span-1">
              <p className="mb-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                Kill Switch Alert
              </p>
              <p className="font-playfair text-[48px] font-bold leading-none text-tract-red">
                {payload?.stats.killSwitchAlerts ?? 0}
              </p>
            </div>
          </div>

          {payload?.killSwitch ? (
            <section className="flex flex-col gap-4 border border-tract-red bg-tract-red/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-tract-red">
                  <AlertTriangle className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h4 className="font-inter text-base font-bold uppercase tracking-tight text-tract-obsidian">
                    {payload.killSwitch.headline}
                  </h4>
                  <p className="font-inter text-sm text-gray-500">{payload.killSwitch.detailLine}</p>
                  <p
                    className={cn(
                      'mt-1 font-inter text-sm font-semibold',
                      payload.killSwitch.hoursLeft < 12 ? 'animate-pulse text-tract-red' : 'text-tract-red',
                    )}
                  >
                    {payload.killSwitch.timerLabel}
                  </p>
                </div>
              </div>
              <Link
                to={`/deals/${payload.killSwitch.dealId}`}
                className="inline-flex shrink-0 items-center justify-center bg-tract-red px-6 py-2 font-inter text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-red-800"
              >
                Upload Proof Now
              </Link>
            </section>
          ) : null}

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-playfair text-[20px] font-bold text-tract-obsidian">Deal Pipeline</h3>
              <button
                type="button"
                disabled={exportMutation.isPending}
                onClick={() => exportMutation.mutate(pipeline)}
                className="border border-gray-200 px-4 py-1.5 font-inter text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
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

            <div className="overflow-hidden border border-gray-100 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      {['Property', 'Progress', 'Timer', 'Action'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-4 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500',
                            h === 'Action' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pipeline.map((deal) => (
                      <tr
                        key={deal.id}
                        className={cn(
                          'transition-colors hover:bg-gray-50',
                          deal.status === 'action_required' && 'bg-tract-red/5',
                        )}
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 shrink-0 overflow-hidden bg-gray-100">
                              <img
                                src={deal.imageUrl || IMAGE_FALLBACK}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-inter text-base font-semibold text-tract-obsidian">
                                {deal.propertyLine}
                              </p>
                              <p className="font-inter text-xs text-gray-500">{deal.portfolioRef}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={cn(
                              'font-inter text-sm font-semibold',
                              deal.status === 'action_required' ? 'text-tract-red' : 'text-tract-green',
                            )}
                          >
                            {deal.stepLabel}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div
                            className={cn(
                              'flex items-center gap-1 font-inter text-sm',
                              deal.timerTone === 'green' ? 'text-tract-green' : 'font-bold text-tract-red',
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
                        <td className="px-6 py-6 text-right">
                          {deal.primaryAction === 'upload' ? (
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-inter text-xs font-bold uppercase tracking-wider text-tract-red hover:underline"
                            >
                              Upload Proof
                            </Link>
                          ) : (
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-inter text-xs font-bold uppercase tracking-wider text-tract-gold hover:underline"
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
              <h3 className="font-playfair text-[20px] font-bold text-tract-obsidian">Active Marketplace Listings</h3>
              <Link
                to="/wholesaler/listings/new"
                className="inline-flex items-center gap-2 bg-tract-gold px-6 py-2 font-inter text-sm font-semibold uppercase tracking-widest text-[#554300] transition-all hover:bg-yellow-500 active:scale-95"
              >
                <Plus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                Create New Listing
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="group border border-gray-100 bg-white transition-all duration-300 hover:border-tract-gold"
                >
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img
                      src={listing.imageUrl || IMAGE_FALLBACK}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 bg-black/50 px-2 py-1 font-inter text-[10px] font-bold uppercase tracking-tighter text-white backdrop-blur-sm">
                      {listing.status === 'live'
                        ? `Live • ${listing.bidCount} Bids`
                        : listing.status.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="mb-1 font-inter text-base font-semibold text-tract-obsidian">{listing.address}</h4>
                    <p className="mb-4 font-inter text-sm text-gray-500">
                      {listing.city}
                      {listing.stateCode ? `, ${listing.stateCode}` : ''}
                    </p>
                    <div className="mb-4 flex justify-between">
                      <div>
                        <span className="font-inter text-[10px] font-bold uppercase text-gray-500">ARV</span>
                        <p className="font-inter text-sm font-bold text-tract-gold">{formatCurrency(listing.arv)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-inter text-[10px] font-bold uppercase text-gray-500">Assignment Fee</span>
                        <p className="font-inter text-sm font-bold text-tract-obsidian">
                          {formatCurrency(listing.assignmentFeeHigh)}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="pt-4">
                      {listing.status === 'live' ? (
                        <Link
                          to={`/wholesaler/listings/${listing.id}`}
                          className="font-inter text-xs font-bold uppercase tracking-wider text-tract-gold hover:underline"
                        >
                          View Bids
                        </Link>
                      ) : (
                        <Link
                          to={`/wholesaler/listings/new?from=${listing.id}`}
                          className="font-inter text-xs font-bold uppercase tracking-wider text-tract-obsidian hover:underline"
                        >
                          Edit Draft
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Link
                to="/wholesaler/listings/new"
                className="group flex min-h-[300px] flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50 p-8 transition-colors hover:border-gray-500"
              >
                <PlusCircle className="mb-4 h-12 w-12 text-gray-300 transition-colors group-hover:text-gray-400" />
                <p className="text-center font-inter text-[12px] font-bold uppercase tracking-widest text-gray-500">
                  New Inventory Opportunity
                </p>
                <p className="mt-2 text-center font-inter text-xs text-gray-400">
                  Expand your portfolio by adding a new wholesale listing to the TRACT marketplace.
                </p>
              </Link>
            </div>
          </section>
        </div>

        <footer className="mt-10 border-t border-gray-100 bg-gray-50">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row md:px-12">
            <div>
              <span className="font-playfair text-[20px] font-bold text-tract-green">TRACT</span>
              <p className="mt-2 font-inter text-sm text-gray-500">
                © 2024 TRACT Private Marketplace. All rights reserved.
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Legal Notices', 'Regulatory Disclosure'].map((label) => (
                <a key={label} href="#" className="font-inter text-sm text-gray-500 transition-colors hover:text-tract-obsidian">
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </main>
    </div>
  )
}
