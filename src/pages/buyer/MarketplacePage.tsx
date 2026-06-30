import {
  BadgeCheck,
  Bell,
  ChevronDown,
  Loader2,
  Search,
  Timer,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLiveListings } from '@/hooks/useListings'
import type { DealType } from '@/types'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { APP2_STATES } from '@/lib/constants/states'
import { cn, formatCurrency } from '@/lib/utils'

const AVATAR_PLACEHOLDER = DEFAULT_AVATAR_IMAGE

function formatCompactUsd(amount: number): string {
  if (amount >= 1_000_000) {
    const v = amount / 1_000_000
    const s = v >= 10 ? String(Math.round(v)) : v.toFixed(1).replace(/\.0$/, '')
    return `$${s}M`
  }
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`
  return formatCurrency(amount)
}

const DEAL_FILTERS = ['All Deals', 'Fix & Flip', 'Hold & Sell', 'Full Gut', 'New Construction'] as const

type ListingDeal = DealType

const FALLBACK_IMAGE = DEFAULT_PROPERTY_IMAGE

const FILTER_TO_DEAL: Record<(typeof DEAL_FILTERS)[number], ListingDeal | null> = {
  'All Deals': null,
  'Fix & Flip': 'fix_flip',
  'Hold & Sell': 'hold_sell',
  'Full Gut': 'full_gut',
  'New Construction': 'new_construction',
}

function timeLeftFromPublished(publishedAt?: string | null): string | undefined {
  if (!publishedAt) return undefined
  const end = new Date(publishedAt).getTime() + 14 * 24 * 60 * 60 * 1000
  const ms = end - Date.now()
  if (ms <= 0) return undefined
  const d = Math.floor(ms / (24 * 60 * 60 * 1000))
  const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  return `${d}d ${h}h left`
}

function dealBadgeClass(deal: ListingDeal) {
  if (deal === 'new_construction') return 'bg-app1-primary text-white'
  return 'bg-tract-burgundy text-white'
}

function dealLabel(deal: ListingDeal) {
  const map = {
    fix_flip: 'Fix & Flip',
    hold_sell: 'Hold & Sell',
    full_gut: 'Full Gut',
    new_construction: 'New Construction',
  }
  return map[deal]
}

export default function MarketplacePage() {
  const user = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [activeDealFilter, setActiveDealFilter] = useState<(typeof DEAL_FILTERS)[number]>('All Deals')
  const [sortBy, setSortBy] = useState('Highest ROI')
  const [minProfit, setMinProfit] = useState(50_000)
  const [appliedMinProfit, setAppliedMinProfit] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [stateFilter, setStateFilter] = useState('')
  const [dealChecks, setDealChecks] = useState<Record<string, boolean>>({
    'Fix & Flip': true,
    'Hold & Sell': true,
    'New Construction': false,
    'Full Gut': false,
  })

  const { data, isLoading, isError } = useLiveListings({
    dealType: FILTER_TO_DEAL[activeDealFilter] ?? undefined,
    minProfit: appliedMinProfit,
    stateCode: stateFilter || undefined,
    page,
    limit: 12,
  })

  const listings = data?.listings ?? []
  const totalAvailable = data?.total ?? 0

  const filteredListings = useMemo(() => {
    if (!search.trim()) return listings
    const q = search.toLowerCase()
    return listings.filter(
      (l) =>
        l.propertyAddress?.toLowerCase().includes(q) ||
        l.stateCode?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q),
    )
  }, [listings, search])

  const displayListings = useMemo(() => {
    const rows = [...filteredListings]
    if (sortBy === 'Highest ROI') {
      rows.sort((a, b) => b.projectedBuyerProfit - a.projectedBuyerProfit)
    } else if (sortBy === 'Newest First') {
      rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return rows
  }, [filteredListings, sortBy])

  const totalPages = Math.max(1, Math.ceil(totalAvailable / 12))

  return (
    <div className="min-h-screen bg-app1-bg-main font-poppins text-app1-text-main selection:bg-app1-secondary selection:text-app1-primary-dark">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-app1-border-light bg-app1-bg-card/95 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-12">
          <div className="flex items-center gap-8 lg:gap-10">
            <Link to="/buyer/dashboard" className="font-cinzel text-[22px] font-black text-app1-primary">
              TRACT
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <span className="border-b-2 border-app1-secondary pb-1 font-poppins text-[13px] font-bold text-app1-secondary">Listings</span>
              <Link
                to="/buyer/dashboard"
                className="font-poppins text-[13px] font-semibold text-app1-text-muted transition-colors hover:text-app1-secondary"
              >
                Portfolio
              </Link>
              <Link
                to="/buyer/deals"
                className="font-poppins text-[13px] font-semibold text-app1-text-muted transition-colors hover:text-app1-secondary"
              >
                Insights
              </Link>
              <a
                href="mailto:support@tract.com"
                className="font-poppins text-[13px] font-semibold text-app1-text-muted transition-colors hover:text-app1-secondary"
              >
                Contact
              </a>
            </nav>
          </div>

          <div className="mx-4 hidden max-w-[400px] flex-1 lg:block">
            <label htmlFor="mkt-search" className="sr-only">
              Search listings
            </label>
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-app1-text-muted"
                strokeWidth={2}
                aria-hidden
              />
              <input
                id="mkt-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by address, state, or ZIP..."
                className="w-full rounded-full border-0 bg-app1-bg-soft py-2.5 pl-11 pr-4 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:outline-none focus:ring-2 focus:ring-app1-secondary/40"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 md:gap-6">
            <button
              type="button"
              className="rounded p-1 text-app1-text-muted transition-colors hover:text-app1-secondary active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            {user?.role === 'buyer' ? (
              <div className="hidden items-center gap-2 rounded-full border border-app1-secondary/40 bg-app1-secondary/10 px-3 py-1.5 sm:flex">
                <BadgeCheck className="h-3.5 w-3.5 text-app1-secondary" strokeWidth={2} aria-hidden />
                <span className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary">
                  Vetted buyer
                </span>
              </div>
            ) : null}
            <div className="h-10 w-10 overflow-hidden rounded-full border border-app1-border-light">
              <img src={AVATAR_PLACEHOLDER} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="fixed left-0 right-0 top-[72px] z-40 border-b border-app1-border-light bg-app1-bg-card/80 backdrop-blur-sm transition-colors duration-200">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:overflow-x-auto md:px-12">
          {DEAL_FILTERS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setActiveDealFilter(label)
                setPage(1)
              }}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.12em] transition-colors',
                activeDealFilter === label
                  ? 'bg-app1-secondary text-app1-primary-dark'
                  : 'bg-app1-bg-soft text-app1-text-muted hover:bg-app1-border-light/60',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 pb-2.5 sm:flex-row sm:items-center sm:overflow-x-auto md:px-12">
          <button
            type="button"
            onClick={() => {
              setStateFilter('')
              setPage(1)
            }}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.12em] transition-colors',
              !stateFilter
                ? 'bg-app1-primary text-white'
                : 'bg-app1-bg-soft text-app1-text-muted hover:bg-app1-border-light/60',
            )}
          >
            All States
          </button>
          {APP2_STATES.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => {
                setStateFilter(s.code)
                setPage(1)
              }}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.12em] transition-colors',
                stateFilter === s.code
                  ? 'bg-app1-primary text-white'
                  : 'bg-app1-bg-soft text-app1-text-muted hover:bg-app1-border-light/60',
              )}
            >
              {s.code}
            </button>
          ))}
          <div className="mx-1 h-4 w-px shrink-0 bg-app1-border-light" aria-hidden />
          {(['ARV Range', 'Fee Range'] as const).map((label) => (
            <button
              key={label}
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-full bg-app1-bg-soft px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.12em] text-app1-text-muted transition-colors hover:bg-app1-border-light/60"
            >
              {label}
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-[180px] md:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-6">
          <div className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="font-cinzel text-3xl font-black text-app1-primary md:text-4xl">
                  Marketplace
                </h1>
                <p className="mt-1 font-poppins text-sm text-app1-text-muted">
                  {isLoading ? '…' : totalAvailable} available institutional grade assets
                </p>
              </div>
              <div className="flex items-center gap-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cursor-pointer border-0 bg-transparent p-0 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-main focus:outline-none focus:ring-0"
                >
                  <option>Highest ROI</option>
                  <option>Newest First</option>
                  <option>Ending Soon</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" aria-hidden />
              </div>
            ) : isError ? (
              <div className="py-20 text-center">
                <p className="font-poppins text-app1-text-muted">Failed to load listings. Please try again.</p>
              </div>
            ) : displayListings.length === 0 ? (
              <p className="mt-8 text-center font-poppins text-app1-text-muted">No listings match your filters.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayListings.map((listing) => {
                  const bidsMax = 10
                  const pct = Math.round((100 * listing.bidCount) / bidsMax)
                  const address = `${listing.propertyAddress}, ${listing.city}`
                  const cityState = `${listing.city}, ${listing.stateCode}`
                  const imageUrl = listing.photoUrls?.[0] ?? FALLBACK_IMAGE
                  const timeLeft = timeLeftFromPublished(listing.publishedAt)
                  return (
                    <div
                      key={listing.id}
                      className="group overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-app1-secondary/50"
                    >
                      <div className="relative h-[180px] overflow-hidden">
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-full w-full object-cover grayscale-[20%] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                        />
                        <div
                          className={cn(
                            'absolute left-3 top-3 rounded-full px-2.5 py-1 font-poppins text-[10px] font-black uppercase tracking-wide',
                            dealBadgeClass(listing.dealType),
                          )}
                        >
                          {dealLabel(listing.dealType)}
                        </div>
                        {timeLeft ? (
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 font-poppins text-[10px] font-bold tracking-wide text-app1-secondary backdrop-blur-sm">
                            <Timer className="h-3 w-3" strokeWidth={2} aria-hidden />
                            {timeLeft}
                          </div>
                        ) : null}
                      </div>
                      <div className="p-6">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-poppins text-base font-black leading-tight text-app1-primary">{address}</h3>
                          <span className="shrink-0 rounded-full bg-app1-bg-soft px-2 py-0.5 font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">
                            {cityState}
                          </span>
                        </div>
                        <div className="mb-4 flex items-center justify-between border-y border-app1-border-light py-3">
                          {(
                            [
                              { label: 'ARV', value: listing.arv },
                              { label: 'Rehab', value: listing.rehabTotal },
                              { label: 'Fee', value: listing.assignmentFeeHigh },
                            ] as const
                          ).map((cell, i) => (
                            <div
                              key={cell.label}
                              className={cn('flex-1 text-center', i < 2 && 'border-r border-app1-border-light')}
                            >
                              <p className="font-poppins text-[10px] font-black uppercase text-app1-text-muted">{cell.label}</p>
                              <p className="font-poppins text-sm font-bold tracking-wide text-app1-text-main">
                                {formatCompactUsd(cell.value)}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mb-4">
                          <span className="font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                            Projected profit
                          </span>
                          <div className="font-cinzel text-[24px] font-black text-app1-secondary">
                            {formatCurrency(listing.projectedBuyerProfit)}
                          </div>
                        </div>
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between font-poppins text-[11px] font-black uppercase tracking-wide">
                            <span className="text-app1-text-muted">
                              {listing.bidCount} of {bidsMax} bids placed
                            </span>
                            <span className="text-app1-secondary">{pct}%</span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-app1-border-light">
                            <div className="h-full bg-app1-secondary" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <Link
                          to={`/buyer/listings/${listing.id}`}
                          className="flex h-11 w-full items-center justify-center bg-app1-secondary font-poppins text-sm font-black uppercase tracking-wide text-app1-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Place bid
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!isLoading && !isError && totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-4 font-poppins text-sm">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-app1-border-light px-4 py-2 font-bold text-app1-text-main disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-app1-text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-app1-border-light px-4 py-2 font-bold text-app1-text-main disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>

          <aside className="w-full shrink-0 lg:w-[320px]">
            <div className="sticky top-[180px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-cinzel text-[20px] font-black text-app1-primary">Market filters</h2>
                <button
                  type="button"
                  className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary hover:underline"
                  onClick={() => {
                    setDealChecks({
                      'Fix & Flip': true,
                      'Hold & Sell': true,
                      'New Construction': false,
                      'Full Gut': false,
                    })
                    setMinProfit(0)
                    setStateFilter('')
                    setPage(1)
                  }}
                >
                  Clear all
                </button>
              </div>

              <div className="mb-6 border-b border-app1-border-light pb-6">
                <span className="mb-3 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                  State
                </span>
                <select
                  value={stateFilter}
                  onChange={(e) => {
                    setStateFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full cursor-pointer rounded-lg border border-app1-border-light bg-app1-bg-card py-2.5 px-3 font-poppins text-sm text-app1-text-main focus:border-app1-secondary focus:outline-none focus:ring-2 focus:ring-app1-secondary/30"
                >
                  <option value="">All States</option>
                  {APP2_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 border-b border-app1-border-light pb-6">
                <span className="mb-3 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                  ARV range
                </span>
                <div className="relative mb-3 h-2 rounded-full bg-app1-border-light">
                  <div className="absolute bottom-0 left-[20%] top-0 right-[30%] rounded-full bg-app1-secondary/80" />
                  <div className="absolute left-[20%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-app1-secondary shadow-lg" />
                  <div className="absolute right-[30%] top-1/2 h-4 w-4 translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-app1-secondary shadow-lg" />
                </div>
                <div className="flex justify-between font-poppins text-sm font-bold tracking-wide text-app1-text-main">
                  <span>$100k</span>
                  <span>$2.5M+</span>
                </div>
              </div>

              <div className="mb-6 border-b border-app1-border-light pb-6">
                <span className="mb-3 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                  Deal type
                </span>
                <div className="space-y-2">
                  {(['Fix & Flip', 'Hold & Sell', 'New Construction', 'Full Gut'] as const).map((label) => (
                    <label key={label} className="flex cursor-pointer items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={dealChecks[label]}
                        onChange={(e) =>
                          setDealChecks((prev) => ({ ...prev, [label]: e.target.checked }))
                        }
                        className="rounded border-app1-border-light bg-app1-bg-card text-app1-secondary focus:ring-app1-secondary focus:ring-offset-0"
                      />
                      <span className="font-poppins text-sm text-app1-text-muted transition-colors group-hover:text-app1-text-main">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <span className="mb-3 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                  Min. projected profit
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app1-text-muted">$</span>
                  <input
                    type="number"
                    value={minProfit || ''}
                    onChange={(e) => setMinProfit(Number(e.target.value) || 0)}
                    className="w-full rounded-lg border border-app1-border-light bg-app1-bg-card py-2.5 pl-8 pr-3 font-poppins text-sm text-app1-text-main focus:border-app1-secondary focus:outline-none focus:ring-2 focus:ring-app1-secondary/30"
                  />
                </div>
              </div>

              <button
                type="button"
                className="mt-8 flex h-12 w-full items-center justify-center bg-app1-secondary font-poppins text-sm font-black uppercase tracking-wide text-app1-primary-dark transition-all hover:scale-[1.02]"
                onClick={() => {
                  setAppliedMinProfit(minProfit > 0 ? minProfit : undefined)
                  setPage(1)
                }}
              >
                Apply filters
              </button>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-12 border-t border-app1-border-light bg-app1-bg-soft">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-12">
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
              <a key={label} href={href} className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
