import { zodResolver } from '@hookform/resolvers/zod'
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Calendar,
  ChevronDown,
  ClipboardList,
  Hammer,
  Home,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { useListing, usePlaceBid } from '@/hooks/useListings'
import { useAuthStore } from '@/store/authStore'
import { useListingSocket } from '@/hooks/useSocket'
import { createBidSchema, type CreateBidFormData } from '@/lib/validators/bid'
import type { DealType, MarketplaceListing } from '@/types'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'

const AVATAR_HEADER = DEFAULT_AVATAR_IMAGE

function formatCompactK(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`.replace('.0M', 'M')
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`
  return formatCurrency(amount)
}

const HERO_FALLBACK = DEFAULT_PROPERTY_IMAGE

function dealTypeLabel(deal: DealType): string {
  const map: Record<DealType, string> = {
    fix_flip: 'Fix & Flip',
    hold_sell: 'Hold & Sell',
    full_gut: 'Full Gut',
    new_construction: 'New Construction',
  }
  return map[deal]
}

function roiPct(listing: MarketplaceListing): number {
  if (!listing.arv) return 0
  return Math.round((100 * listing.projectedBuyerProfit) / listing.arv)
}

function AccordionRow({
  title,
  icon: Icon,
  defaultOpen,
  children,
}: {
  title: string
  icon: ComponentType<{ className?: string; strokeWidth?: number; 'aria-hidden'?: boolean }>
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div className="rounded-lg border border-theme-border bg-theme-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-theme-surface-2"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-tract-gold" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-base text-theme-text">{title}</span>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 text-theme-muted transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open ? <div className="border-t border-theme-border px-4 pb-4 pt-2 font-inter text-sm text-theme-muted">{children}</div> : null}
    </div>
  )
}

export default function BuyerListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const isKycPending = user?.kycStatus !== 'approved'
  const isPofPending = user?.pofStatus !== 'approved'
  const { data: listing, isLoading, isError } = useListing(id)
  const placeBid = usePlaceBid(id ?? '')

  useListingSocket(id)

  const [showTerms, setShowTerms] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateBidFormData>({
    resolver: zodResolver(createBidSchema) as Resolver<CreateBidFormData>,
    defaultValues: {
      assignmentPrice: 45_000,
      emdAmount: 5_000,
      proposedClosingDate: '',
      inspectionDays: 7,
      specialTerms: '',
    },
  })

  const bidPrice = watch('assignmentPrice') ?? 0

  const netMargin = useMemo(
    () => (listing ? listing.projectedBuyerProfit - bidPrice : 0),
    [listing, bidPrice],
  )

  const bidSlotsMax = 10
  const bidPct = listing ? Math.round((100 * listing.bidCount) / bidSlotsMax) : 0

  const onBidSubmit = (data: CreateBidFormData) => {
    if (!listing) return
    placeBid.mutate({
      listingId: listing.id,
      assignmentPrice: data.assignmentPrice,
      emdAmount: data.emdAmount ?? 0,
      proposedClosingDate: data.proposedClosingDate,
      inspectionDays: data.inspectionDays ?? 7,
      specialTerms: data.specialTerms,
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-theme-bg">
        <Loader2 className="h-12 w-12 animate-spin text-tract-gold" aria-hidden />
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-theme-bg px-4 text-center font-inter text-theme-muted">
        <p>We couldn&apos;t load this listing.</p>
        <Link to="/buyer/marketplace" className="text-tract-gold underline">
          Back to marketplace
        </Link>
      </div>
    )
  }

  const headlineAddress = `${listing.propertyAddress}, ${listing.city}, ${listing.stateCode}`
  const heroImageUrl = listing.photoUrls?.[0] ?? HERO_FALLBACK
  const purchase = listing.purchasePrice ?? 0

  return (
    <div className="min-h-screen bg-theme-bg font-inter text-theme-text selection:bg-tract-gold selection:text-[#554300]">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b border-theme-border bg-theme-topbar px-4 md:mx-auto md:max-w-[1440px] md:px-12">
        <div className="flex items-center gap-8 lg:gap-10">
          <Link to="/buyer/marketplace" className="font-playfair text-[24px] font-bold text-tract-gold">
            TRACT
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/buyer/marketplace"
              className="border-b-2 border-tract-gold py-2 font-inter text-sm font-bold text-tract-gold"
            >
              Marketplace
            </Link>
            <a href="/buyer/dashboard" className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted hover:text-theme-text">
              Portfolio
            </a>
            <a href="/buyer/history" className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted hover:text-theme-text">
              Analytics
            </a>
            <a href="/buyer/dashboard" className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted hover:text-theme-text">
              Private office
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            className="hidden rounded border border-theme-border px-3 py-2 font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted transition-colors hover:border-tract-gold sm:inline-block"
          >
            Member status
          </button>
          <Link
            to="/wholesaler/listings/new"
            className="rounded bg-tract-gold px-3 py-2 font-inter text-[12px] font-bold uppercase tracking-wider text-[#3c2f00] transition-transform hover:scale-105"
          >
            List asset
          </Link>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-theme-border">
            <img src={AVATAR_HEADER} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-24 md:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:gap-6">
            <div className="flex w-full flex-col gap-6">
              <div className="group relative h-[380px] w-full overflow-hidden rounded-lg">
                <img
                  src={heroImageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#0B0E11]/95 via-[#0B0E11]/40 to-transparent p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {listing.status === 'live' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-tract-green px-3 py-1 font-inter text-[12px] font-bold uppercase tracking-wider text-white">
                        <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        Live listing
                      </span>
                    ) : null}
                    <span className="rounded-full bg-tract-burgundy px-3 py-1 font-inter text-[12px] font-bold uppercase tracking-wider text-white">
                      {dealTypeLabel(listing.dealType)} deal
                    </span>
                  </div>
                  <h1 className="font-playfair text-3xl font-bold leading-tight text-white md:text-[32px]">
                    {headlineAddress}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { Icon: Hammer, label: dealTypeLabel(listing.dealType) },
                  { Icon: BarChart3, label: `ARV: ${formatCompactK(listing.arv)}` },
                  { Icon: Home, label: `${listing.city}, ${listing.stateCode}` },
                  { Icon: Calendar, label: `ZIP ${listing.zipCode}` },
                ].map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-theme-border bg-theme-surface-2 px-3 py-2"
                  >
                    <Icon className="h-[18px] w-[18px] text-tract-gold" strokeWidth={1.75} aria-hidden />
                    <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-text">{label}</span>
                  </div>
                ))}
              </div>

              <section className="rounded-xl border border-theme-border bg-theme-card p-6 transition-transform duration-300 hover:scale-[1.01]">
                <p className="font-inter text-[12px] font-bold uppercase tracking-widest text-theme-muted">
                  Projected buyer profit
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-4">
                  <span className="font-playfair text-[56px] font-bold leading-none text-tract-gold">
                    {formatCurrency(listing.projectedBuyerProfit)}
                  </span>
                  <span className="rounded-lg bg-tract-green/20 px-3 py-1 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-green-light">
                    +{roiPct(listing)}% ROI
                  </span>
                </div>
                <div className="mt-4 border-t border-theme-border pt-4">
                  <p className="flex flex-wrap gap-x-3 font-inter text-[13px] font-semibold tracking-wide text-theme-muted">
                    <span>ARV {formatCompactK(listing.arv)}</span>
                    <span>−</span>
                    <span>Purchase {formatCompactK(purchase)}</span>
                    <span>−</span>
                    <span>Rehab {(listing.rehabTotal / 1000).toFixed(1)}K</span>
                  </p>
                </div>
              </section>

              <div className="flex flex-col items-center justify-between gap-6 rounded-xl border border-theme-border bg-theme-card p-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-tract-gold">
                    <img src={AVATAR_HEADER} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-playfair text-xl font-bold text-theme-text">{listing.wholesaler.fullName}</h3>
                      <ShieldCheck className="h-[18px] w-[18px] text-tract-gold" strokeWidth={2} aria-hidden />
                    </div>
                    <p className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold/80">
                      Verified wholesaler · score {listing.wholesaler.reliabilityScore}
                    </p>
                  </div>
                </div>
                <div className="grid w-full grid-cols-3 gap-6 border-t border-theme-border pt-6 md:w-auto md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <div className="text-center">
                    <p className="font-playfair text-xl font-bold text-tract-gold">—</p>
                    <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-theme-muted">Closed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-playfair text-xl font-bold text-tract-gold">{listing.wholesaler.reliabilityScore}</p>
                    <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-theme-muted">Reliability</p>
                  </div>
                  <div className="text-center">
                    <p className="font-playfair text-xl font-bold text-tract-gold">—</p>
                    <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-theme-muted">Member</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <AccordionRow title="Condition report" icon={ClipboardList}>
                  Summary of property condition and recent inspections will appear here when available from the
                  wholesaler.
                </AccordionRow>
                <AccordionRow title="Financial disclosure" icon={Wallet}>
                  Detailed financials and assignment structure are released after bid acceptance.
                </AccordionRow>
                <AccordionRow title="Market data" icon={Activity}>
                  Comps and neighborhood trends for this asset class.
                </AccordionRow>
              </div>
            </div>

            <div className="w-full md:w-[40%]">
              <aside className="sticky top-24 flex flex-col gap-6">
                <div className="rounded-xl border border-theme-border bg-theme-card p-6 shadow-xl">
                  <h2 className="mb-6 border-b border-theme-border pb-4 font-playfair text-xl font-bold text-theme-text">
                    Submit assignment bid
                  </h2>

                  <div className="mb-6 rounded-lg border border-theme-border bg-theme-surface-2 p-4">
                    <p className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">
                      Market Price
                    </p>
                    <p className="mt-1 font-playfair text-2xl font-bold text-tract-gold">
                      {formatCurrency(listing.assignmentFeeHigh)}
                    </p>
                  </div>

                  {!listing.bidsOpen ? (
                    <p className="font-inter text-sm text-theme-muted">
                      Bidding closed for this listing.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmit(onBidSubmit)}>
                      {isKycPending ? (
                        <div className="mb-4 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle
                              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                            <div>
                              <p className="font-inter text-[13px] font-bold text-amber-800">
                                Identity verification required
                              </p>
                              <p className="mt-1 font-inter text-[12px] text-amber-700">
                                You must verify your identity before placing bids.
                              </p>
                              <Link
                                to="/register/kyc"
                                className="mt-2 inline-block font-inter text-[12px] font-bold uppercase tracking-wider text-amber-800 hover:underline"
                              >
                                Verify now →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      {!isKycPending && isPofPending ? (
                        <div className="mb-4 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle
                              className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                              strokeWidth={1.75}
                              aria-hidden
                            />
                            <div>
                              <p className="font-inter text-[13px] font-bold text-amber-800">
                                Proof of funds required
                              </p>
                              <p className="mt-1 font-inter text-[12px] text-amber-700">
                                {user?.pofStatus === 'pending'
                                  ? "Your proof of funds is under review. You'll be notified when approved."
                                  : user?.pofStatus === 'rejected'
                                    ? 'Your proof of funds was rejected. Please resubmit.'
                                    : 'You must submit proof of funds before placing bids.'}
                              </p>
                              <Link
                                to="/buyer/proof-of-funds"
                                className="mt-2 inline-block font-inter text-[12px] font-bold uppercase tracking-wider text-amber-800 hover:underline"
                              >
                                {user?.pofStatus === 'pending' ? 'View status →' : 'Submit now →'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <div className="mb-8">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-inter text-sm text-theme-muted">
                            {listing.bidCount} of {bidSlotsMax} bid slots used
                          </span>
                          <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold">
                            {bidSlotsMax - listing.bidCount} slots remaining
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-theme-surface-2">
                          <div className="h-full bg-tract-gold" style={{ width: `${bidPct}%` }} />
                        </div>
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="bid-amount"
                          className="mb-2 block font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted"
                        >
                          Your assignment price
                        </label>
                        <div className="flex items-center border-b-2 border-tract-gold bg-theme-surface-2 p-4">
                          <span className="mr-2 font-playfair text-2xl text-theme-text">$</span>
                          <input
                            id="bid-amount"
                            type="number"
                            min={1}
                            step={1}
                            {...register('assignmentPrice', { valueAsNumber: true })}
                            className="w-full border-0 bg-transparent p-0 font-playfair text-[28px] text-theme-text focus:outline-none focus:ring-0"
                          />
                        </div>
                        {errors.assignmentPrice ? (
                          <p className="mt-2 font-inter text-xs text-tract-rose">{errors.assignmentPrice.message}</p>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="emd-amount"
                          className="mb-2 block font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted"
                        >
                          EMD Amount
                        </label>
                        <div className="flex items-center border-b-2 border-tract-gold bg-theme-surface-2">
                          <span className="pl-4 font-inter text-[16px] font-bold text-theme-muted">$</span>
                          <input
                            id="emd-amount"
                            type="number"
                            min={0}
                            {...register('emdAmount', { valueAsNumber: true })}
                            className="flex-1 border-0 bg-transparent py-3 pl-2 pr-4 font-inter text-[16px] text-theme-text focus:outline-none"
                            placeholder="5,000"
                          />
                        </div>
                        {errors.emdAmount ? (
                          <p className="mt-1 font-inter text-xs text-tract-rose">{errors.emdAmount.message}</p>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="closing-date"
                          className="mb-2 block font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted"
                        >
                          Target Closing Date <span className="text-tract-rose">*</span>
                        </label>
                        <input
                          id="closing-date"
                          type="date"
                          {...register('proposedClosingDate')}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          className="w-full border-b-2 border-tract-gold bg-theme-surface-2 px-4 py-3 font-inter text-[15px] text-theme-text focus:outline-none"
                        />
                        {errors.proposedClosingDate ? (
                          <p className="mt-1 font-inter text-xs text-tract-rose">{errors.proposedClosingDate.message}</p>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <label className="mb-2 block font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                          Inspection Period
                        </label>
                        <div className="flex gap-2">
                          {[3, 7, 10].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setValue('inspectionDays', days)}
                              className={cn(
                                'flex-1 border py-2.5 font-inter text-[13px] font-bold transition-colors',
                                watch('inspectionDays') === days
                                  ? 'border-tract-gold bg-tract-gold text-white'
                                  : 'border-theme-border bg-theme-surface-2 text-theme-muted hover:border-tract-gold',
                              )}
                            >
                              {days} days
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <button
                          type="button"
                          onClick={() => setShowTerms((s) => !s)}
                          className="flex items-center gap-1 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                          Add special terms
                        </button>
                        {showTerms ? (
                          <textarea
                            {...register('specialTerms')}
                            placeholder="e.g. 10-day inspection period, all-cash offer…"
                            rows={4}
                            className="mt-3 w-full rounded-lg border border-theme-border bg-theme-input p-3 font-inter text-sm text-theme-text placeholder:text-theme-muted focus:border-tract-gold focus:outline-none focus:ring-1 focus:ring-tract-gold"
                          />
                        ) : null}
                      </div>

                      <div className="mb-8 flex flex-col gap-2 rounded-lg border border-theme-border bg-theme-surface-2 p-4">
                        <div className="flex justify-between font-inter text-sm">
                          <span className="text-theme-muted">Your bid</span>
                          <span className="font-semibold tracking-wide text-theme-text">{formatCurrency(bidPrice)}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-theme-border pt-2 font-inter text-[13px]">
                          <div>
                            <span className="text-theme-muted">Platform fee (1.5%)</span>
                            <p className="mt-0.5 font-inter text-[10px] text-theme-muted">
                              Paid at closing · success-based only
                            </p>
                          </div>
                          <span className="font-semibold text-tract-red">-{formatCurrency(Math.round(bidPrice * 0.015))}</span>
                        </div>
                        <div className="mt-1 flex justify-between border-t border-theme-border pt-2 font-inter text-[13px] font-bold">
                          <span className="text-theme-text">Net after TRACT fee</span>
                          <span className="text-tract-green">
                            {formatCurrency(Math.max(0, bidPrice - Math.round(bidPrice * 0.015)))}
                          </span>
                        </div>
                        <div className="flex justify-between font-inter text-[13px]">
                          <span className="text-theme-muted">EMD</span>
                          <span className="font-semibold text-theme-text">{formatCurrency(watch('emdAmount') ?? 0)}</span>
                        </div>
                        <div className="flex justify-between font-inter text-[13px]">
                          <span className="text-theme-muted">Closing date</span>
                          <span className="font-semibold text-theme-text">
                            {watch('proposedClosingDate')
                              ? new Date(watch('proposedClosingDate')).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between font-inter text-[13px]">
                          <span className="text-theme-muted">Inspection</span>
                          <span className="font-semibold text-theme-text">{watch('inspectionDays') ?? 7} days</span>
                        </div>
                        <div className="flex justify-between font-inter text-sm">
                          <span className="text-theme-muted">vs. Projected profit</span>
                          <span className="font-semibold tracking-wide text-theme-text">
                            {formatCurrency(listing.projectedBuyerProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-theme-border pt-2 font-inter text-sm">
                          <span className="font-bold text-tract-green-light">Your net profit margin</span>
                          <span className="font-semibold tracking-wide text-tract-green-light">{formatCurrency(netMargin)}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={placeBid.isPending || !listing.bidsOpen || isKycPending || isPofPending}
                        className="flex h-14 w-full items-center justify-center gap-2 bg-tract-gold font-inter text-sm font-bold uppercase tracking-[0.15em] text-theme-text transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                      >
                        {placeBid.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                            Submitting…
                          </>
                        ) : (
                          `Place bid — ${formatCurrency(bidPrice)}`
                        )}
                      </button>

                      <div className="mt-6 flex gap-3 opacity-60">
                        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-theme-muted" strokeWidth={1.75} aria-hidden />
                        <p className="font-inter text-[12px] italic leading-snug text-theme-muted">
                          Pre-contract chat is disabled for this deal type. Direct communication opens upon assignment
                          acceptance.
                        </p>
                      </div>
                    </form>
                  )}
                </div>

                <button
                  type="button"
                  className="w-full border border-tract-rose py-3 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-rose transition-colors hover:bg-tract-rose/10"
                >
                  Request full DD package
                </button>
              </aside>
            </div>
          </div>
      </main>

      <footer className="mt-24 w-full border-t border-theme-border bg-theme-bg px-4 py-10 md:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="font-playfair text-xl font-bold text-tract-gold">TRACT</span>
            <p className="text-center font-inter text-sm text-theme-muted md:text-left">
              © 2024 TRACT Private Marketplace. All rights reserved. Access restricted to verified members.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            {[
              { label: 'Legal disclosures', href: '/legal/terms' },
              { label: 'Privacy policy', href: '/legal/privacy' },
              { label: 'Terms of service', href: '/legal/terms' },
              { label: 'Compliance', href: '/legal/terms' },
              { label: 'Contact office', href: 'mailto:support@tract.com' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted hover:text-theme-text">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
