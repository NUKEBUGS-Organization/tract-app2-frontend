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
  if (deal === 'new_construction') return 'bg-tract-green text-white'
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
    <div className="min-h-screen bg-tract-alabaster font-inter text-tract-obsidian selection:bg-tract-gold selection:text-[#554300]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-12">
          <div className="flex items-center gap-8 lg:gap-10">
            <Link to="/buyer/dashboard" className="font-playfair text-[24px] font-bold text-tract-green">
              TRACT
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <span className="border-b-2 border-tract-gold pb-1 font-inter text-base text-tract-gold">Listings</span>
              <Link
                to="/buyer/dashboard"
                className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold"
              >
                Portfolio
              </Link>
              <Link
                to="/buyer/deals"
                className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold"
              >
                Insights
              </Link>
              <a
                href="mailto:support@tract.com"
                className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold"
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
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                strokeWidth={2}
                aria-hidden
              />
              <input
                id="mkt-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by address, state, or ZIP..."
                className="w-full rounded-full border-0 bg-gray-100 py-2 pl-11 pr-4 font-inter text-sm text-tract-obsidian placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-tract-gold"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 md:gap-6">
            <button
              type="button"
              className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            {user?.role === 'buyer' ? (
              <div className="hidden items-center gap-2 rounded-full border border-tract-gold/40 bg-tract-gold/5 px-3 py-1 sm:flex">
                <BadgeCheck className="h-3.5 w-3.5 text-tract-gold" strokeWidth={2} aria-hidden />
                <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold">
                  Vetted buyer
                </span>
              </div>
            ) : null}
            <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200">
              <img src={AVATAR_PLACEHOLDER} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="fixed left-0 right-0 top-[72px] z-40 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        {/* Row 1 — Deal type */}
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto px-4 py-2 md:px-12">
          {DEAL_FILTERS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setActiveDealFilter(label)
                setPage(1)
              }}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-1.5 font-inter text-[12px] font-bold uppercase tracking-wider transition-colors',
                activeDealFilter === label
                  ? 'bg-tract-gold text-[#3c2f00]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Row 2 — State + range filters */}
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 overflow-x-auto border-t border-gray-50 px-4 pb-2 md:px-12">
          <button
            type="button"
            onClick={() => {
              setStateFilter('')
              setPage(1)
            }}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 font-inter text-[12px] font-bold uppercase tracking-wider transition-colors',
              !stateFilter
                ? 'bg-tract-green text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
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
                'whitespace-nowrap rounded-full px-3 py-1.5 font-inter text-[12px] font-bold uppercase tracking-wider transition-colors',
                stateFilter === s.code
                  ? 'bg-tract-green text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {s.code}
            </button>
          ))}
          <div className="mx-1 h-4 w-px shrink-0 bg-gray-200" aria-hidden />
          {(['ARV Range', 'Fee Range'] as const).map((label) => (
            <button
              key={label}
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-4 py-1.5 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-600 transition-colors hover:bg-gray-200"
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
                <h1 className="font-playfair text-3xl font-bold text-tract-green md:text-4xl">
                  Marketplace
                </h1>
                <p className="mt-1 font-inter text-sm text-gray-500">
                  {isLoading ? '…' : totalAvailable} available institutional grade assets
                </p>
              </div>
              <div className="flex items-center gap-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cursor-pointer border-0 bg-transparent p-0 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-obsidian focus:outline-none focus:ring-0"
                >
                  <option>Highest ROI</option>
                  <option>Newest First</option>
                  <option>Ending Soon</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-tract-gold" aria-hidden />
              </div>
            ) : isError ? (
              <div className="py-20 text-center">
                <p className="font-inter text-gray-500">Failed to load listings. Please try again.</p>
              </div>
            ) : displayListings.length === 0 ? (
              <p className="mt-8 text-center font-inter text-gray-500">No listings match your filters.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                      className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:scale-[1.02] hover:border-tract-gold/60"
                    >
                      <div className="relative h-[180px]">
                        <img
                          src={imageUrl}
                          alt=""
                          className="h-full w-full object-cover grayscale-[20%] transition-all group-hover:grayscale-0"
                        />
                        <div
                          className={cn(
                            'absolute left-3 top-3 rounded-sm px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wider',
                            dealBadgeClass(listing.dealType),
                          )}
                        >
                          {dealLabel(listing.dealType)}
                        </div>
                        {timeLeft ? (
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-sm bg-black/70 px-2 py-1 font-inter text-[10px] font-semibold tracking-wide text-tract-gold backdrop-blur-sm">
                            <Timer className="h-3 w-3" strokeWidth={2} aria-hidden />
                            {timeLeft}
                          </div>
                        ) : null}
                      </div>
                      <div className="p-6">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-inter text-base font-bold leading-tight text-tract-obsidian">{address}</h3>
                          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wide text-gray-500">
                            {cityState}
                          </span>
                        </div>
                        <div className="mb-4 flex items-center justify-between border-y border-gray-100 py-3">
                          {(
                            [
                              { label: 'ARV', value: listing.arv },
                              { label: 'Rehab', value: listing.rehabTotal },
                              { label: 'Fee', value: listing.assignmentFeeHigh },
                            ] as const
                          ).map((cell, i) => (
                            <div
                              key={cell.label}
                              className={cn('flex-1 text-center', i < 2 && 'border-r border-gray-100')}
                            >
                              <p className="font-inter text-[10px] font-bold uppercase text-gray-500">{cell.label}</p>
                              <p className="font-inter text-sm font-semibold tracking-wide text-tract-obsidian">
                                {formatCompactUsd(cell.value)}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="mb-4">
                          <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Projected profit
                          </span>
                          <div className="font-playfair text-[24px] font-bold text-tract-gold">
                            {formatCurrency(listing.projectedBuyerProfit)}
                          </div>
                        </div>
                        <div className="mb-4 space-y-2">
                          <div className="flex justify-between font-inter text-[11px] font-bold uppercase tracking-wide">
                            <span className="text-gray-500">
                              {listing.bidCount} of {bidsMax} bids placed
                            </span>
                            <span className="text-tract-gold">{pct}%</span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full bg-tract-gold" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <Link
                          to={`/buyer/listings/${listing.id}`}
                          className="flex h-11 w-full items-center justify-center bg-tract-gold font-inter text-sm font-bold uppercase tracking-wider text-[#3c2f00] transition-colors hover:bg-yellow-500 active:scale-[0.98]"
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
              <div className="mt-8 flex items-center justify-center gap-4 font-inter text-sm">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-gray-200 px-4 py-2 font-semibold text-tract-obsidian disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded border border-gray-200 px-4 py-2 font-semibold text-tract-obsidian disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>

          <aside className="w-full shrink-0 lg:w-[320px]">
            <div className="sticky top-[180px] rounded-xl border border-gray-100 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-playfair text-[20px] font-bold text-tract-obsidian">Market filters</h2>
                <button
                  type="button"
                  className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
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

              <div className="mb-6 border-b border-gray-100 pb-6">
                <span className="mb-3 block font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                  State
                </span>
                <select
                  value={stateFilter}
                  onChange={(e) => {
                    setStateFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-full cursor-pointer rounded-sm border border-gray-200 bg-white py-2 px-3 font-inter text-sm text-tract-obsidian focus:border-tract-gold focus:outline-none focus:ring-1 focus:ring-tract-gold"
                >
                  <option value="">All States</option>
                  {APP2_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 border-b border-gray-100 pb-6">
                <span className="mb-3 block font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                  ARV range
                </span>
                <div className="relative mb-3 h-2 rounded-full bg-gray-200">
                  <div className="absolute bottom-0 left-[20%] top-0 right-[30%] rounded-full bg-tract-gold/80" />
                  <div className="absolute left-[20%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-tract-gold shadow-lg" />
                  <div className="absolute right-[30%] top-1/2 h-4 w-4 translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-tract-gold shadow-lg" />
                </div>
                <div className="flex justify-between font-inter text-sm font-semibold tracking-wide text-tract-obsidian">
                  <span>$100k</span>
                  <span>$2.5M+</span>
                </div>
              </div>

              <div className="mb-6 border-b border-gray-100 pb-6">
                <span className="mb-3 block font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
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
                        className="rounded border-gray-300 bg-white text-tract-gold focus:ring-tract-gold focus:ring-offset-0"
                      />
                      <span className="font-inter text-sm text-gray-500 transition-colors group-hover:text-tract-obsidian">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <span className="mb-3 block font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                  Min. projected profit
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={minProfit || ''}
                    onChange={(e) => setMinProfit(Number(e.target.value) || 0)}
                    className="w-full rounded-sm border border-gray-200 bg-white py-2 pl-8 pr-3 font-inter text-sm text-tract-obsidian focus:border-tract-gold focus:outline-none focus:ring-1 focus:ring-tract-gold"
                  />
                </div>
              </div>

              <button
                type="button"
                className="mt-8 flex h-12 w-full items-center justify-center bg-tract-gold font-inter text-sm font-bold uppercase tracking-widest text-[#3c2f00] transition-all hover:brightness-110"
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

      <footer className="mt-12 border-t border-gray-100 bg-gray-50">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-12">
          <div>
            <span className="font-playfair text-[20px] font-bold text-tract-green">TRACT</span>
            <p className="mt-2 font-inter text-sm text-gray-500">
              © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Privacy Policy', href: '/legal/privacy' },
              { label: 'Terms of Service', href: '/legal/terms' },
              { label: 'Legal Notices', href: '/legal/terms' },
              { label: 'Regulatory Disclosure', href: '/legal/terms' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="font-inter text-sm text-gray-500 transition-colors hover:text-tract-obsidian">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
