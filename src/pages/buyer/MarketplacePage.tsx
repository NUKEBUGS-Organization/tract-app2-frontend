import { Loader2, MapPin, Search, Timer, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/authStore'
import { useLiveListings } from '@/hooks/useListings'
import type { DealType } from '@/types'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { APP2_STATES } from '@/lib/constants/states'
import { cn, formatCurrency } from '@/lib/utils'

const PAGE_SIZE = 12

const DEAL_TYPES: Array<{ value: DealType | ''; label: string }> = [
  { value: '', label: 'All deal types' },
  { value: 'fix_flip', label: 'Fix & Flip' },
  { value: 'hold_sell', label: 'Hold & Sell' },
  { value: 'full_gut', label: 'Full Gut' },
  { value: 'new_construction', label: 'New Construction' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'ending_soon', label: 'Ending soon' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

const DEAL_LABEL: Record<DealType, string> = {
  fix_flip: 'Fix & Flip',
  hold_sell: 'Hold & Sell',
  full_gut: 'Full Gut',
  new_construction: 'New Construction',
}

function compactUsd(amount: number): string {
  if (!amount || amount <= 0) return '—'
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    return `$${(millions >= 10 ? Math.round(millions) : Number(millions.toFixed(1))).toString()}M`
  }
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`
  return formatCurrency(amount)
}

function timeLeftFromPublished(publishedAt?: string | null): string | null {
  if (!publishedAt) return null
  const remaining = new Date(publishedAt).getTime() + 14 * 24 * 60 * 60 * 1000 - Date.now()
  if (remaining <= 0) return null
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  if (days >= 1) return `${days}d left`
  return `${Math.max(1, Math.floor(remaining / (60 * 60 * 1000)))}h left`
}

const selectClass =
  'h-11 w-full cursor-pointer rounded-xl border border-app1-border-light bg-app1-bg-card px-3 font-poppins text-sm text-app1-text-main focus:border-app1-secondary focus:outline-none focus:ring-2 focus:ring-app1-secondary/30'

export default function MarketplacePage() {
  const user = useAuthStore((state) => state.user)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [dealType, setDealType] = useState<DealType | ''>('')
  const [stateCode, setStateCode] = useState('')
  const [sort, setSort] = useState<SortValue>('newest')
  const [page, setPage] = useState(1)

  // Typing shouldn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, isError } = useLiveListings({
    dealType: dealType || undefined,
    stateCode: stateCode || undefined,
    search: search || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  })

  const listings = data?.listings ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilters = Boolean(search || dealType || stateCode)

  const summary = useMemo(() => {
    if (isLoading) return 'Loading properties...'
    const noun = total === 1 ? 'property' : 'properties'
    const stateName = APP2_STATES.find((state) => state.code === stateCode)?.name
    return `${total} ${noun}${stateName ? ` in ${stateName}` : ''}${search ? ` matching "${search}"` : ''}`
  }, [isLoading, total, stateCode, search])

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setDealType('')
    setStateCode('')
    setPage(1)
  }

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] p-6 md:p-10">
          <div className="mb-8">
            <h1 className="font-cinzel text-3xl font-black text-app1-primary">Marketplace</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app1-text-muted">{summary}</p>
          </div>

          <div className="mb-8 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-4 shadow-app1-card">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="relative md:col-span-5">
                <label htmlFor="marketplace-search" className="sr-only">
                  Search properties
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app1-text-muted"
                  strokeWidth={2}
                  aria-hidden
                />
                <input
                  id="marketplace-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by address, city or ZIP"
                  className="h-11 w-full rounded-xl border border-app1-border-light bg-app1-bg-card pl-9 pr-3 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-2 focus:ring-app1-secondary/30"
                />
              </div>

              <div className="md:col-span-3">
                <label htmlFor="marketplace-state" className="sr-only">
                  State
                </label>
                <select
                  id="marketplace-state"
                  value={stateCode}
                  onChange={(event) => {
                    setStateCode(event.target.value)
                    setPage(1)
                  }}
                  className={selectClass}
                >
                  <option value="">All states</option>
                  {APP2_STATES.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="marketplace-deal-type" className="sr-only">
                  Deal type
                </label>
                <select
                  id="marketplace-deal-type"
                  value={dealType}
                  onChange={(event) => {
                    setDealType(event.target.value as DealType | '')
                    setPage(1)
                  }}
                  className={selectClass}
                >
                  {DEAL_TYPES.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="marketplace-sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="marketplace-sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as SortValue)
                    setPage(1)
                  }}
                  className={selectClass}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 inline-flex items-center gap-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary hover:underline"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                Clear filters
              </button>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-9 w-9 animate-spin text-app1-secondary" aria-hidden />
            </div>
          ) : isError ? (
            <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center">
              <p className="font-poppins text-sm text-app1-text-muted">
                We could not load the marketplace. Please refresh and try again.
              </p>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center">
              <p className="font-poppins text-base font-bold text-app1-text-main">No properties found</p>
              <p className="mt-2 font-poppins text-sm text-app1-text-muted">
                {hasFilters ? 'Try widening your filters.' : 'New properties appear here as sellers list them.'}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-app1-secondary px-5 py-2.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => {
                const timeLeft = timeLeftFromPublished(listing.publishedAt)
                return (
                  <Link
                    key={listing.id}
                    to={`/buyer/listings/${listing.id}`}
                    className="group flex flex-col overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card transition-all duration-200 hover:-translate-y-0.5 hover:border-app1-secondary/50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-app1-secondary"
                  >
                    <div className="relative h-[184px] overflow-hidden bg-app1-bg-soft">
                      <img
                        src={listing.photoUrls?.[0] ?? DEFAULT_PROPERTY_IMAGE}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-app1-primary/90 px-2.5 py-1 font-poppins text-[10px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                        {DEAL_LABEL[listing.dealType]}
                      </span>
                      {timeLeft ? (
                        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 font-poppins text-[10px] font-bold text-white backdrop-blur-sm">
                          <Timer className="h-3 w-3" strokeWidth={2} aria-hidden />
                          {timeLeft}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="font-poppins text-base font-bold leading-snug text-app1-primary">
                        {listing.propertyAddress}
                      </h2>
                      <p className="mt-1 inline-flex items-center gap-1 font-poppins text-xs text-app1-text-muted">
                        <MapPin className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        {listing.city}, {listing.stateCode}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-app1-bg-soft p-3">
                        <div>
                          <p className="font-poppins text-[10px] font-black uppercase tracking-[0.12em] text-app1-text-muted">
                            Asking price
                          </p>
                          <p className="mt-0.5 font-poppins text-lg font-black text-app1-primary">
                            {compactUsd(listing.assignmentFeeHigh)}
                          </p>
                        </div>
                        <div>
                          <p className="font-poppins text-[10px] font-black uppercase tracking-[0.12em] text-app1-text-muted">
                            ARV
                          </p>
                          <p className="mt-0.5 font-poppins text-lg font-bold text-app1-text-main">
                            {compactUsd(listing.arv)}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 font-poppins text-xs text-app1-text-muted">
                        {listing.bidCount === 0
                          ? 'No bids yet'
                          : `${listing.bidCount} bid${listing.bidCount === 1 ? '' : 's'} placed`}
                      </p>

                      <span className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark transition-colors group-hover:bg-app1-secondary/90">
                        {user?.role === 'buyer' ? 'View & place bid' : 'View property'}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {!isLoading && !isError && totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-4 font-poppins text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className={cn(
                  'rounded-xl border border-app1-border-light px-4 py-2 font-bold text-app1-text-main transition-colors',
                  page <= 1 ? 'cursor-not-allowed opacity-40' : 'hover:bg-app1-bg-soft',
                )}
              >
                Previous
              </button>
              <span className="text-app1-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className={cn(
                  'rounded-xl border border-app1-border-light px-4 py-2 font-bold text-app1-text-main transition-colors',
                  page >= totalPages ? 'cursor-not-allowed opacity-40' : 'hover:bg-app1-bg-soft',
                )}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
