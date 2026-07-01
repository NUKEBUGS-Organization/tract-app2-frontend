import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Hammer,
  Images,
  LayoutDashboard,
  Loader2,
  Map,
  Menu,
  Search,
  Settings,
  Upload,
  Wallet,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useListing } from '@/hooks/useListings'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'
import type { DealType, MarketplaceListing } from '@/types'

type ListingBid = {
  _id?: string
  id?: string
  buyerId?: { fullName?: string; _id?: string; id?: string } | string
  assignmentPrice?: number
  status?: string
  createdAt?: string
}

const CHECKLIST_ITEMS = [
  { key: 'arv', label: 'ARV & Comps Upload', icon: Upload },
  { key: 'rehab', label: 'Rehab Cost Estimate', icon: Hammer },
  { key: 'deal', label: 'Deal Type & Assignment Fee', icon: DollarSign },
  { key: 'media', label: 'Media Vault (Photos + Video)', icon: Images },
] as const

function dealTypeLabel(dealType: DealType): string {
  const labels: Record<DealType, string> = {
    fix_flip: 'Fix & Flip',
    hold_sell: 'Hold & Sell',
    full_gut: 'Full Gut',
    new_construction: 'New Construction',
  }
  return labels[dealType] ?? 'Single Family Home'
}

function checklistProgress(listing: MarketplaceListing) {
  const checks = [
    listing.arv > 0,
    listing.rehabTotal > 0,
    listing.assignmentFeeHigh > 0,
    Boolean(listing.photoUrls?.length),
  ]
  const completed = checks.filter(Boolean).length
  return { completed, total: checks.length }
}

export default function DraftListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: listing, isLoading, isError } = useListing(listingId)

  const isLive = listing?.status === 'live'
  const isUnderContract = listing?.status === 'under_contract'

  const { data: bidsData } = useQuery({
    queryKey: ['bids', 'listing', listingId],
    queryFn: async () => {
      const { data } = await api.get(`/bids/listing/${listingId}`)
      return data.data as ListingBid[]
    },
    enabled: !!listingId && (isLive || isUnderContract),
  })

  const bids = bidsData ?? []

  const { data: dealData } = useQuery({
    queryKey: ['deal', 'listing', listingId],
    queryFn: async () => {
      const { data } = await api.get(`/deals?listingId=${listingId}`)
      const deals = data.data
      if (Array.isArray(deals) && deals.length > 0) {
        return deals[0]
      }
      return null
    },
    enabled: !!listingId && isUnderContract,
  })

  const dealId =
    dealData && typeof dealData === 'object'
      ? (dealData as { id?: string; _id?: string }).id ??
        (dealData as { _id?: string })._id
      : undefined

  const startIntakeMutation = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
    },
    onSuccess: () => {
      if (listing) {
        navigate(`/wholesaler/listings/new?from=${encodeURIComponent(listing.id)}`)
      }
    },
  })

  const progress = listing ? checklistProgress(listing) : { completed: 0, total: 4 }
  const progressPct =
    progress.total > 0 ? Math.round((100 * progress.completed) / progress.total) : 0

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app1-bg-main">
        <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" aria-label="Loading listing" />
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app1-bg-main">
        <AlertTriangle className="h-10 w-10 text-app1-danger" aria-hidden />
        <p className="font-poppins text-app1-text-muted">Listing not found.</p>
        <Link to="/wholesaler/listings" className="font-poppins text-sm font-semibold text-app1-secondary hover:underline">
          Back to listings
        </Link>
      </div>
    )
  }

  const primaryBid = bids.find((b) => b.status === 'primary')
  const primaryBuyerName =
    primaryBid && typeof primaryBid.buyerId === 'object'
      ? primaryBid.buyerId.fullName
      : 'Buyer'

  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins text-app1-text-main">
      <header className="sticky top-0 z-50 mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-app1-border-light bg-app1-bg-card px-5 py-4 md:px-12">
        <button
          type="button"
          onClick={() => setSidebarOpen((s) => !s)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-app1-border-light bg-app1-bg-soft md:hidden"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 text-app1-text-main" />
          ) : (
            <Menu className="h-5 w-5 text-app1-text-main" />
          )}
        </button>
        <div className="flex items-center gap-10">
          <Link to="/wholesaler/dashboard" className="font-cinzel text-[24px] font-bold tracking-tight text-app1-secondary">
            TRACT
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/buyer/marketplace" className="border-b-2 border-app1-secondary pb-1 font-poppins text-base text-app1-secondary">
              Listings
            </Link>
            <a href="/wholesaler/dashboard" className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary">
              Portfolio
            </a>
            <a href="/wholesaler/dashboard" className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary">
              Insights
            </a>
            <a href="mailto:support@tract.com" className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary">
              Contact
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app1-text-muted"
              aria-hidden
            />
            <label htmlFor="marketplace-search" className="sr-only">
              Search marketplace
            </label>
            <input
              id="marketplace-search"
              type="search"
              placeholder="Search marketplace..."
              className="w-64 rounded-lg border border-app1-border-light bg-app1-bg-soft py-2 pl-10 pr-4 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:outline-none focus:ring-1 focus:ring-app1-secondary"
            />
          </div>
          <Link
            to="/buyer/marketplace"
            className="rounded-lg bg-app1-secondary px-6 py-2 font-poppins text-sm font-semibold text-[#554300] transition-transform active:scale-95"
          >
            Invest Now
          </Link>
        </div>
      </header>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      ) : null}

      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40',
            'w-[280px] flex-col gap-2',
            'border-r border-app1-border-light',
            'bg-app1-bg-soft py-10 pl-6 pr-4',
            'transition-transform duration-300',
            'md:relative md:translate-x-0 md:flex',
            sidebarOpen ? 'flex translate-x-0' : '-translate-x-full hidden md:flex',
          )}
        >
          <div className="mb-6 flex flex-col gap-1">
            <span className="mb-2 px-2 font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
              Management
            </span>
            <Link
              to={`/wholesaler/listings/${listing.id}`}
              className="flex items-center gap-3 rounded-lg bg-app1-bg-soft p-3 font-poppins text-base text-app1-secondary"
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Inventory
            </Link>
            <a
              href="/wholesaler/deals"
              className="flex items-center gap-3 rounded-lg p-3 font-poppins text-base text-app1-text-muted transition-colors hover:bg-app1-bg-soft"
            >
              <Wallet className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Transactions
            </a>
            <a
              href="/wholesaler/dashboard"
              className="flex items-center gap-3 rounded-lg p-3 font-poppins text-base text-app1-text-muted transition-colors hover:bg-app1-bg-soft"
            >
              <BarChart3 className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Performance
            </a>
          </div>
          <div className="mt-auto flex flex-col gap-1">
            <a
              href="/wholesaler/settings"
              className="flex items-center gap-3 rounded-lg p-3 font-poppins text-base text-app1-text-muted transition-colors hover:bg-app1-bg-soft"
            >
              <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Settings
            </a>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-app1-bg-main">
            <div className="mx-auto max-w-[900px] space-y-6 p-6 md:p-12">
              <section className="rounded-xl border border-black/5 bg-app1-bg-card p-8 shadow-app1-card">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  {listing.status === 'live' && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-blue-600">
                      <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                      <span className="font-poppins text-[12px] font-bold uppercase tracking-wider">
                        Live on Marketplace
                      </span>
                    </div>
                  )}
                  {listing.status === 'under_contract' && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-app1-primary/10 px-4 py-1.5 text-app1-primary">
                      <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                      <span className="font-poppins text-[12px] font-bold uppercase tracking-wider">
                        Contract Secured
                      </span>
                    </div>
                  )}
                  {listing.status === 'draft' && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-app1-bg-soft px-4 py-1.5 text-app1-text-muted">
                      <span className="font-poppins text-[12px] font-bold uppercase tracking-wider">Draft</span>
                    </div>
                  )}
                  {listing.status === 'pending_review' && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-amber-700">
                      <span className="font-poppins text-[12px] font-bold uppercase tracking-wider">
                        Pending Review
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-app1-primary" strokeWidth={2} aria-hidden />
                    <span className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                      {listing.wholesaler?.fullName ?? 'Wholesaler listing'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h1 className="font-cinzel text-[24px] font-bold text-app1-text-main">
                      {listing.propertyAddress}, {listing.city}, {listing.stateCode} {listing.zipCode}
                    </h1>
                    <span className="inline-block rounded bg-app1-bg-soft px-2 py-1 font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                      {dealTypeLabel(listing.dealType)}
                    </span>
                  </div>
                  <div className="md:text-right">
                    <p className="mb-1 font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                      Purchase Price
                    </p>
                    <p className="font-cinzel text-[24px] font-bold text-app1-text-main">
                      {formatCurrency(listing.purchasePrice ?? 0)}
                    </p>
                  </div>
                </div>
              </section>

              {(listing.status === 'draft' || listing.status === 'pending_review') && (
                <section id="checklist" className="rounded-xl border border-black/5 bg-app1-bg-card p-8 shadow-app1-card">
                  <div className="mb-6 h-px w-full bg-tract-graphite/10" />

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                        Fields Required Before Publishing
                      </span>
                      <span className="font-poppins text-sm text-app1-text-muted">
                        {progress.completed} of {progress.total} completed
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-app1-primary transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <ul className="space-y-4">
                      {CHECKLIST_ITEMS.map(({ key, label, icon: Icon }) => (
                        <li
                          key={key}
                          className="flex items-center justify-between rounded-lg border border-black/5 bg-app1-bg-main/80 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6 shrink-0 text-app1-text-muted" strokeWidth={1.75} aria-hidden />
                            <span className="font-poppins text-base text-app1-text-main">{label}</span>
                          </div>
                          <span className="rounded bg-app1-bg-soft px-2 py-1 font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-text-muted">
                            Required
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={startIntakeMutation.isPending}
                      aria-busy={startIntakeMutation.isPending}
                      onClick={() => startIntakeMutation.mutate()}
                      className={cn(
                        'flex h-14 w-full items-center justify-center gap-3 rounded-lg font-poppins text-sm font-bold uppercase tracking-[0.15em] text-white shadow-md transition-all active:scale-[0.98]',
                        'bg-app1-secondary shadow-app1-secondary/20 hover:bg-yellow-600',
                      )}
                    >
                      {startIntakeMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                          Starting…
                        </>
                      ) : (
                        <>
                          Start Intake Form
                          <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}

              {(isLive || isUnderContract) && (
                <section className="rounded-xl border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
                  <div className="mb-8 grid grid-cols-3 gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-soft p-6 shadow-app1-card">
                    <div className="text-center">
                      <p className="mb-1 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted">
                        Bids Received
                      </p>
                      <p className="font-cinzel text-[40px] font-bold text-app1-secondary">{bids.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="mb-1 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted">
                        Slots Left
                      </p>
                      <p className="font-cinzel text-[40px] font-bold text-app1-secondary">{10 - bids.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="mb-1 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted">
                        Market Price
                      </p>
                      <p className="font-cinzel text-[40px] font-bold text-app1-secondary">
                        {formatCurrency(listing.assignmentFeeHigh ?? 0)}
                      </p>
                    </div>
                  </div>

                  {isUnderContract && (
                    <div className="mb-6 rounded-lg border border-app1-primary/30 bg-app1-primary/10 p-4">
                      <p className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-primary">
                        Winning bid
                      </p>
                      <p className="mt-1 font-poppins text-[14px] text-app1-text-main">
                        {primaryBid
                          ? `${primaryBuyerName} — ${formatCurrency(primaryBid.assignmentPrice ?? 0)}`
                          : 'Primary buyer selected — deal in progress.'}
                      </p>
                      <Link
                        to={dealId ? `/deals/${dealId}` : '/wholesaler/deals'}
                        className="mt-2 inline-block font-poppins text-[13px] font-semibold text-app1-secondary hover:underline"
                      >
                        View deal →
                      </Link>
                    </div>
                  )}

                  <h3 className="mb-4 font-cinzel text-[20px] font-bold text-app1-primary">Bids Received</h3>

                  {bids.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="font-poppins text-[14px] text-app1-text-muted">
                        No bids yet. Share your listing to attract buyers.
                      </p>
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                          {['Buyer', 'Bid Amount', 'Status', 'Submitted', 'Action'].map((h) => (
                            <th
                              key={h}
                              className={cn(
                                'px-4 py-3 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted',
                                h === 'Action' && 'text-right',
                              )}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-app1-border-light">
                        {bids.map((bid) => {
                          const buyer = bid.buyerId
                          const bidId = bid._id ?? bid.id ?? ''
                          return (
                            <tr key={bidId} className="transition-colors hover:bg-app1-bg-soft">
                              <td className="px-4 py-4">
                                <p className="font-poppins text-[14px] font-bold text-app1-text-main">
                                  {typeof buyer === 'object' ? buyer?.fullName : 'Buyer'}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-poppins text-[14px] font-bold text-app1-secondary">
                                  {formatCurrency(bid.assignmentPrice ?? 0)}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={cn(
                                    'inline-block rounded-full px-3 py-1 font-poppins text-[11px] font-bold uppercase tracking-wider',
                                    bid.status === 'primary'
                                      ? 'bg-app1-primary/10 text-app1-primary'
                                      : bid.status === 'active'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'bg-app1-bg-soft text-app1-text-muted',
                                  )}
                                >
                                  {bid.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 font-poppins text-[12px] text-app1-text-muted">
                                {bid.createdAt
                                  ? new Date(bid.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : '—'}
                              </td>
                              <td className="px-4 py-4 text-right">
                                {bid.status === 'active' && isLive && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await api.post(`/bids/listing/${listingId}/select`, {
                                          primaryBidId: bidId,
                                        })

                                        const buyerRef = bid.buyerId
                                        const primaryBuyerId =
                                          typeof buyerRef === 'object'
                                            ? buyerRef?._id ?? buyerRef?.id
                                            : buyerRef

                                        const dealRes = await api.post('/deals', {
                                          listingId,
                                          primaryBidId: bidId,
                                          primaryBuyerId,
                                          wholesalerId: listing.wholesalerId ?? user?.id,
                                          emdAmount: 0,
                                        })

                                        const deal = dealRes.data?.data as
                                          | { id?: string; _id?: string }
                                          | undefined
                                        const newDealId = deal?.id ?? deal?._id

                                        toast.success('Contract secured! Deal created.')

                                        if (newDealId) {
                                          navigate(`/deals/${newDealId}`)
                                        } else {
                                          window.location.reload()
                                        }
                                      } catch (err: unknown) {
                                        const msg =
                                          err &&
                                          typeof err === 'object' &&
                                          'response' in err
                                            ? (
                                                err as {
                                                  response?: { data?: { message?: string } }
                                                }
                                              ).response?.data?.message
                                            : undefined
                                        toast.error(msg ?? 'Failed to select bid.')
                                      }
                                    }}
                                    className="rounded bg-app1-secondary px-4 py-1.5 font-poppins text-[12px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-yellow-600"
                                  >
                                    Select Bid
                                  </button>
                                )}
                                {bid.status === 'primary' && (
                                  <span className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-primary">
                                    Selected ✓
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </section>
              )}

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="group relative aspect-video overflow-hidden rounded-xl bg-[#272A2E]">
                  <img
                    src={listing.photoUrls?.[0] ?? DEFAULT_PROPERTY_IMAGE}
                    alt="Property exterior"
                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-6">
                    <span className="font-poppins text-[12px] font-bold uppercase tracking-wider text-white">
                      Property Exterior Preview
                    </span>
                  </div>
                </div>
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#1D2023] p-2">
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 text-app1-text-muted">
                    <Map className="h-12 w-12" strokeWidth={1.25} aria-hidden />
                    <p className="text-center font-poppins text-sm">
                      {isLive || isUnderContract
                        ? 'Map view coming soon'
                        : 'Map View Restricted until published'}
                    </p>
                  </div>
                </div>
              </section>
            </div>
        </main>
      </div>

      <footer className="border-t border-white/10 bg-[#191C1F]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-5 py-10 md:flex-row md:px-12">
          <div>
            <span className="font-cinzel text-[20px] font-bold text-app1-secondary">TRACT</span>
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
              <a key={label} href={href} className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
