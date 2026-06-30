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
    <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-app1-bg-soft"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-app1-text-muted transition-colors group-hover:text-app1-secondary" strokeWidth={1.75} aria-hidden />
          <span className="font-poppins text-base text-app1-text-main">{title}</span>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 text-app1-text-muted transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open ? <div className="border-t border-app1-border-light px-4 pb-4 pt-2 font-poppins text-sm text-app1-text-muted">{children}</div> : null}
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
      <div className="flex min-h-screen items-center justify-center bg-app1-bg-main">
        <Loader2 className="h-12 w-12 animate-spin text-app1-secondary" aria-hidden />
      </div>
    )
  }

  if (isError || !listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app1-bg-main px-4 text-center font-poppins text-app1-text-muted">
        <p>We couldn&apos;t load this listing.</p>
        <Link to="/buyer/marketplace" className="text-app1-secondary underline">
          Back to marketplace
        </Link>
      </div>
    )
  }

  const headlineAddress = `${listing.propertyAddress}, ${listing.city}, ${listing.stateCode}`
  const heroImageUrl = listing.photoUrls?.[0] ?? HERO_FALLBACK
  const purchase = listing.purchasePrice ?? 0

  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins text-app1-text-main selection:bg-app1-secondary selection:text-app1-primary-dark">
      <header className="fixed left-0 right-0 top-0 z-50 flex h-20 w-full items-center justify-between border-b border-app1-border-light bg-app1-bg-card px-4 md:mx-auto md:max-w-[1440px] md:px-12">
        <div className="flex items-center gap-8 lg:gap-10">
          <Link to="/buyer/marketplace" className="font-cinzel text-[22px] font-black text-app1-secondary">
            TRACT
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/buyer/marketplace"
              className="border-b-2 border-app1-secondary py-2 font-poppins text-sm font-bold text-app1-secondary"
            >
              Marketplace
            </Link>
            <a href="/buyer/dashboard" className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted hover:text-app1-text-main">
              Portfolio
            </a>
            <a href="/buyer/history" className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted hover:text-app1-text-main">
              Analytics
            </a>
            <a href="/buyer/dashboard" className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted hover:text-app1-text-main">
              Private office
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button
            type="button"
            className="hidden rounded-lg border border-app1-border-light px-3 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted transition-colors hover:border-app1-secondary sm:inline-block"
          >
            Member status
          </button>
          <Link
            to="/wholesaler/listings/new"
            className="rounded-lg bg-app1-secondary px-3 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark transition-transform hover:scale-105"
          >
            List asset
          </Link>
          <div className="h-10 w-10 overflow-hidden rounded-full border border-app1-border-light">
            <img src={AVATAR_HEADER} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
      </header>

      <main className="mx-auto flex-1 max-w-[1440px] px-4 pb-12 pt-24 md:px-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:gap-6">
            <div className="flex w-full flex-col gap-6">
              <div className="group relative h-[380px] w-full overflow-hidden rounded-app1-card">
                <img
                  src={heroImageUrl}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#0B0E11]/95 via-[#0B0E11]/40 to-transparent p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {listing.status === 'live' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-app1-primary px-3 py-1 font-poppins text-[11px] font-black uppercase tracking-wide text-white">
                        <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                        Live listing
                      </span>
                    ) : null}
                    <span className="rounded-full bg-tract-burgundy px-3 py-1 font-poppins text-[11px] font-black uppercase tracking-wide text-white">
                      {dealTypeLabel(listing.dealType)} deal
                    </span>
                  </div>
                  <h1 className="font-cinzel text-3xl font-black leading-tight text-white md:text-[32px]">
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
                    className="flex items-center gap-2 rounded-full border border-app1-border-light bg-app1-bg-soft px-3 py-2"
                  >
                    <Icon className="h-[18px] w-[18px] text-app1-secondary" strokeWidth={1.75} aria-hidden />
                    <span className="font-poppins text-[11px] font-black uppercase tracking-wide text-app1-text-main">{label}</span>
                  </div>
                ))}
              </div>

              <section className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-transform duration-300 hover:scale-[1.01]">
                <p className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                  Projected buyer profit
                </p>
                <div className="mt-2 flex flex-wrap items-baseline gap-4">
                  <span className="font-cinzel text-[56px] font-black leading-none text-app1-secondary">
                    {formatCurrency(listing.projectedBuyerProfit)}
                  </span>
                  <span className="rounded-lg bg-app1-primary/15 px-3 py-1 font-poppins text-[11px] font-black uppercase tracking-wide text-app1-primary">
                    +{roiPct(listing)}% ROI
                  </span>
                </div>
                <div className="mt-4 border-t border-app1-border-light pt-4">
                  <p className="flex flex-wrap gap-x-3 font-poppins text-[13px] font-bold tracking-wide text-app1-text-muted">
                    <span>ARV {formatCompactK(listing.arv)}</span>
                    <span>−</span>
                    <span>Purchase {formatCompactK(purchase)}</span>
                    <span>−</span>
                    <span>Rehab {(listing.rehabTotal / 1000).toFixed(1)}K</span>
                  </p>
                </div>
              </section>

              <div className="flex flex-col items-center justify-between gap-6 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-app1-secondary">
                    <img src={AVATAR_HEADER} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-cinzel text-xl font-black text-app1-primary">{listing.wholesaler.fullName}</h3>
                      <ShieldCheck className="h-[18px] w-[18px] text-app1-secondary" strokeWidth={2} aria-hidden />
                    </div>
                    <p className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary/80">
                      Verified wholesaler · score {listing.wholesaler.reliabilityScore}
                    </p>
                  </div>
                </div>
                <div className="grid w-full grid-cols-3 gap-6 border-t border-app1-border-light pt-6 md:w-auto md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <div className="text-center">
                    <p className="font-cinzel text-xl font-black text-app1-secondary">—</p>
                    <p className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">Closed</p>
                  </div>
                  <div className="text-center">
                    <p className="font-cinzel text-xl font-black text-app1-secondary">{listing.wholesaler.reliabilityScore}</p>
                    <p className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">Reliability</p>
                  </div>
                  <div className="text-center">
                    <p className="font-cinzel text-xl font-black text-app1-secondary">—</p>
                    <p className="font-poppins text-[10px] font-black uppercase tracking-wide text-app1-text-muted">Member</p>
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
                <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                  <h2 className="mb-6 border-b border-app1-border-light pb-4 font-cinzel text-xl font-black text-app1-primary">
                    Submit assignment bid
                  </h2>

                  <div className="mb-6 rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
                    <p className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                      Market Price
                    </p>
                    <p className="mt-1 font-cinzel text-2xl font-black text-app1-secondary">
                      {formatCurrency(listing.assignmentFeeHigh)}
                    </p>
                  </div>

                  {!listing.bidsOpen ? (
                    <p className="font-poppins text-sm text-app1-text-muted">
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
                              <p className="font-poppins text-[13px] font-black text-amber-800">
                                Identity verification required
                              </p>
                              <p className="mt-1 font-poppins text-[12px] text-amber-700">
                                You must verify your identity before placing bids.
                              </p>
                              <Link
                                to="/register/kyc"
                                className="mt-2 inline-block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-amber-800 hover:underline"
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
                              <p className="font-poppins text-[13px] font-black text-amber-800">
                                Proof of funds required
                              </p>
                              <p className="mt-1 font-poppins text-[12px] text-amber-700">
                                {user?.pofStatus === 'pending'
                                  ? "Your proof of funds is under review. You'll be notified when approved."
                                  : user?.pofStatus === 'rejected'
                                    ? 'Your proof of funds was rejected. Please resubmit.'
                                    : 'You must submit proof of funds before placing bids.'}
                              </p>
                              <Link
                                to="/buyer/proof-of-funds"
                                className="mt-2 inline-block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-amber-800 hover:underline"
                              >
                                {user?.pofStatus === 'pending' ? 'View status →' : 'Submit now →'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <div className="mb-8">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-poppins text-sm text-app1-text-muted">
                            {listing.bidCount} of {bidSlotsMax} bid slots used
                          </span>
                          <span className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary">
                            {bidSlotsMax - listing.bidCount} slots remaining
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-app1-border-light">
                          <div className="h-full bg-app1-secondary" style={{ width: `${bidPct}%` }} />
                        </div>
                      </div>

                      <div className="mb-6">
                        <label
                          htmlFor="bid-amount"
                          className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted"
                        >
                          Your assignment price
                        </label>
                        <div className="flex items-center border-b-2 border-app1-secondary bg-app1-bg-soft p-4">
                          <span className="mr-2 font-cinzel text-2xl text-app1-text-main">$</span>
                          <input
                            id="bid-amount"
                            type="number"
                            min={1}
                            step={1}
                            {...register('assignmentPrice', { valueAsNumber: true })}
                            className="w-full border-0 bg-transparent p-0 font-cinzel text-[28px] text-app1-text-main focus:outline-none focus:ring-0"
                          />
                        </div>
                        {errors.assignmentPrice ? (
                          <p className="mt-2 font-poppins text-xs text-app1-danger">{errors.assignmentPrice.message}</p>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="emd-amount"
                          className="mb-2 block font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted"
                        >
                          EMD Amount
                        </label>
                        <div className="flex items-center border-b-2 border-app1-secondary bg-app1-bg-soft">
                          <span className="pl-4 font-poppins text-[16px] font-bold text-app1-text-muted">$</span>
                          <input
                            id="emd-amount"
                            type="number"
                            min={0}
                            {...register('emdAmount', { valueAsNumber: true })}
                            className="flex-1 border-0 bg-transparent py-3 pl-2 pr-4 font-poppins text-[16px] text-app1-text-main focus:outline-none"
                            placeholder="5,000"
                          />
                        </div>
                        {errors.emdAmount ? (
                          <p className="mt-1 font-poppins text-xs text-app1-danger">{errors.emdAmount.message}</p>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="closing-date"
                          className="mb-2 block font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted"
                        >
                          Target Closing Date <span className="text-app1-danger">*</span>
                        </label>
                        <input
                          id="closing-date"
                          type="date"
                          {...register('proposedClosingDate')}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          className="w-full border-b-2 border-app1-secondary bg-app1-bg-soft px-4 py-3 font-poppins text-[15px] text-app1-text-main focus:outline-none"
                        />
                        {errors.proposedClosingDate ? (
                          <p className="mt-1 font-poppins text-xs text-app1-danger">{errors.proposedClosingDate.message}</p>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <label className="mb-2 block font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                          Inspection Period
                        </label>
                        <div className="flex gap-2">
                          {[3, 7, 10].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setValue('inspectionDays', days)}
                              className={cn(
                                'flex-1 rounded-lg border py-2.5 font-poppins text-[13px] font-bold transition-colors',
                                watch('inspectionDays') === days
                                  ? 'border-app1-secondary bg-app1-secondary text-app1-primary-dark'
                                  : 'border-app1-border-light bg-app1-bg-soft text-app1-text-muted hover:border-app1-secondary',
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
                          className="flex items-center gap-1 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary hover:underline"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                          Add special terms
                        </button>
                        {showTerms ? (
                          <textarea
                            {...register('specialTerms')}
                            placeholder="e.g. 10-day inspection period, all-cash offer…"
                            rows={4}
                            className="mt-3 w-full rounded-xl border border-app1-border-light bg-app1-bg-soft p-3 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-2 focus:ring-app1-secondary/30"
                          />
                        ) : null}
                      </div>

                      <div className="mb-8 flex flex-col gap-2 rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
                        <div className="flex justify-between font-poppins text-sm">
                          <span className="text-app1-text-muted">Your bid</span>
                          <span className="font-bold tracking-wide text-app1-text-main">{formatCurrency(bidPrice)}</span>
                        </div>
                        <div className="mt-2 flex justify-between border-t border-app1-border-light pt-2 font-poppins text-[13px]">
                          <div>
                            <span className="text-app1-text-muted">Platform fee (1.5%)</span>
                            <p className="mt-0.5 font-poppins text-[10px] text-app1-text-muted">
                              Paid at closing · success-based only
                            </p>
                          </div>
                          <span className="font-bold text-app1-danger">-{formatCurrency(Math.round(bidPrice * 0.015))}</span>
                        </div>
                        <div className="mt-1 flex justify-between border-t border-app1-border-light pt-2 font-poppins text-[13px] font-bold">
                          <span className="text-app1-text-main">Net after TRACT fee</span>
                          <span className="text-app1-primary">
                            {formatCurrency(Math.max(0, bidPrice - Math.round(bidPrice * 0.015)))}
                          </span>
                        </div>
                        <div className="flex justify-between font-poppins text-[13px]">
                          <span className="text-app1-text-muted">EMD</span>
                          <span className="font-bold text-app1-text-main">{formatCurrency(watch('emdAmount') ?? 0)}</span>
                        </div>
                        <div className="flex justify-between font-poppins text-[13px]">
                          <span className="text-app1-text-muted">Closing date</span>
                          <span className="font-bold text-app1-text-main">
                            {watch('proposedClosingDate')
                              ? new Date(watch('proposedClosingDate')).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between font-poppins text-[13px]">
                          <span className="text-app1-text-muted">Inspection</span>
                          <span className="font-bold text-app1-text-main">{watch('inspectionDays') ?? 7} days</span>
                        </div>
                        <div className="flex justify-between font-poppins text-sm">
                          <span className="text-app1-text-muted">vs. Projected profit</span>
                          <span className="font-bold tracking-wide text-app1-text-main">
                            {formatCurrency(listing.projectedBuyerProfit)}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-app1-border-light pt-2 font-poppins text-sm">
                          <span className="font-black text-app1-primary">Your net profit margin</span>
                          <span className="font-bold tracking-wide text-app1-primary">{formatCurrency(netMargin)}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={placeBid.isPending || !listing.bidsOpen || isKycPending || isPofPending}
                        className="flex h-14 w-full items-center justify-center gap-2 bg-app1-secondary font-poppins text-sm font-black uppercase tracking-[0.15em] text-app1-primary-dark transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
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
                        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-app1-text-muted" strokeWidth={1.75} aria-hidden />
                        <p className="font-poppins text-[12px] italic leading-snug text-app1-text-muted">
                          Pre-contract chat is disabled for this deal type. Direct communication opens upon assignment
                          acceptance.
                        </p>
                      </div>
                    </form>
                  )}
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl border border-tract-rose py-3 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-tract-rose transition-colors hover:bg-tract-rose/10"
                >
                  Request full DD package
                </button>
              </aside>
            </div>
          </div>
      </main>

      <footer className="mt-auto w-full border-t border-app1-border-light bg-app1-bg-main px-4 py-10 md:px-12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="font-cinzel text-xl font-black text-app1-secondary">TRACT</span>
            <p className="text-center font-poppins text-sm text-app1-text-muted md:text-left">
              © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved. Access restricted to verified members.
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
              <a key={label} href={href} className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted hover:text-app1-text-main">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
