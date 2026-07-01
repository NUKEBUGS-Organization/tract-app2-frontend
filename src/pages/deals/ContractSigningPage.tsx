import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleCheck, Clock, FileSignature, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useDeal } from '@/hooks/useDeal'
import { useContractPdf } from '@/hooks/usePdf'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'
import type { MarketplaceDeal, MarketplaceListing } from '@/types'

const SELLER_AVATAR = DEFAULT_AVATAR_IMAGE
const BUYER_AVATAR = DEFAULT_AVATAR_IMAGE

const ARTICLES = [
  {
    title: 'ARTICLE I: ASSIGNMENT OF CONTRACT',
    blur: 'blur-[1px]',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  },
  {
    title: 'ARTICLE II: CONSIDERATION',
    blur: 'blur-[1px]',
    body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  },
  {
    title: 'ARTICLE III: CLOSING AND POSSESSION',
    blur: 'blur-[1.5px]',
    body: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.',
  },
  {
    title: 'ARTICLE IV: REPRESENTATIONS AND WARRANTIES',
    blur: 'blur-[2px]',
    body: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
  },
]

function contractRefFromDealId(dealId: string | undefined): string {
  if (!dealId) return 'C-2047'
  const slug = dealId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()
  return slug ? `C-${slug}` : 'C-2047'
}

function listingFromDeal(deal: MarketplaceDeal | undefined): Partial<MarketplaceListing> | null {
  const raw = deal?.listingId
  if (raw && typeof raw === 'object') {
    return raw as Partial<MarketplaceListing>
  }
  return null
}

function propertyAddressLine(deal: MarketplaceDeal | undefined): string {
  const listing = listingFromDeal(deal)
  if (!listing?.propertyAddress) return 'Property Address Pending'
  return [listing.propertyAddress, listing.city, listing.stateCode].filter(Boolean).join(', ')
}

export default function ContractSigningPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: deal, isLoading } = useDeal(dealId)
  const downloadContract = useContractPdf(dealId)

  useEffect(() => {
    if (!dealId) {
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [dealId, navigate])

  const buyerDisplayName = user?.fullName?.trim() || 'Jordan Martinez'
  const wholesalerName = deal?.wholesaler?.fullName?.trim() || 'Wholesaler'
  const contractRef = useMemo(() => contractRefFromDealId(dealId), [dealId])
  const address = propertyAddressLine(deal)

  const listing = listingFromDeal(deal)
  const marketPrice = listing?.assignmentFeeHigh ?? 45_000

  const terms = useMemo(
    () =>
      [
        { label: 'Assignment price', value: `${formatCurrency(marketPrice)}.00` },
        { label: 'Inspection period', value: '7 days' },
        { label: 'Due diligence', value: '10 business days' },
        { label: 'Market Price', value: `${formatCurrency(marketPrice)}.00` },
        {
          label: 'Special terms',
          value: 'Cash offer, 10-day close. No contingencies.',
          wide: true,
        },
      ] as const,
    [marketPrice],
  )

  const executionDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    [],
  )

  const [agreed, setAgreed] = useState(false)
  const [signed, setSigned] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!deal?.createdAt || deal.currentStep !== 'contract_signed') {
      setTimeLeft(null)
      setIsExpired(false)
      return undefined
    }

    const dealCreatedAt = new Date(deal.createdAt)
    const deadline = new Date(dealCreatedAt.getTime() + 24 * 60 * 60 * 1000)

    const tick = () => {
      const diff = deadline.getTime() - Date.now()
      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setIsExpired(false)
      setTimeLeft({
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      })
    }

    tick()
    const interval = setInterval(tick, 1_000)
    return () => clearInterval(interval)
  }, [deal])

  const onSubmit = () => {
    if (isExpired) {
      toast.error('The 24-hour signing window has expired.')
      return
    }
    if (!agreed) {
      toast.error('Please confirm you have read and agree to the terms.')
      return
    }
    setSigned(true)
    toast.success('Contract signed successfully.')
  }

  if (!dealId) return null

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <main className="min-h-screen bg-app1-bg-main p-6 md:p-10">
      <header className="sticky top-0 z-40 -mx-6 w-full border-b border-app1-border-light bg-app1-bg-card md:-mx-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link to="/buyer/dashboard" className="font-cinzel text-2xl font-black text-app1-primary">
            TRACT
          </Link>
          <p className="font-poppins text-base text-app1-text-muted">Contract #{contractRef}</p>
        </div>
      </header>

      <div className="w-full border-b border-app1-primary/20 bg-app1-primary/10 py-2">
        <div className="mx-auto max-w-[800px] text-center">
          <span className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-primary">
            Step 1 of 8 — Contract activation
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[800px] px-4 py-10 font-poppins text-app1-text-main antialiased md:px-0">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" aria-label="Loading contract" />
          </div>
        ) : (
        <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-10">
          <div className="mb-6">
            <h1 className="mb-1 font-cinzel text-3xl font-black text-app1-text-main">
              Purchase &amp; assignment agreement
            </h1>
            <p className="font-poppins text-base text-app1-text-muted">{address}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 rounded-lg bg-app1-bg-soft p-6 md:grid-cols-2">
            <div className="flex items-center gap-4">
              <img
                src={SELLER_AVATAR}
                alt=""
                className="h-12 w-12 rounded-full border border-app1-primary/20 object-cover"
              />
              <div>
                <p className="font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">Seller/wholesaler</p>
                <p className="font-poppins text-base font-bold text-app1-text-main">{wholesalerName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-app1-primary/10 px-2 py-0.5 font-poppins text-[10px] font-black text-app1-primary">
                    Wholesaler
                  </span>
                  <span className="flex items-center font-poppins text-[10px] font-bold text-app1-primary">
                    Verified
                    <CircleCheck className="ml-0.5 h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={BUYER_AVATAR}
                alt=""
                className="h-12 w-12 rounded-full border border-app1-primary/20 object-cover"
              />
              <div>
                <p className="font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">Buyer</p>
                <p className="font-poppins text-base font-bold text-app1-text-main">{buyerDisplayName}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-app1-primary/10 px-2 py-0.5 font-poppins text-[10px] font-black text-app1-primary">
                    End buyer
                  </span>
                  <span className="flex items-center font-poppins text-[10px] font-bold text-app1-primary">
                    Verified
                    <CircleCheck className="ml-0.5 h-3 w-3" strokeWidth={2.5} aria-hidden />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-app1-border-light pt-6">
            <h3 className="mb-4 font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">
              Key agreement terms
            </h3>
            <div className="space-y-0">
              {terms.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-1 border-b border-app1-border-light py-2 sm:flex-row sm:items-start sm:justify-between"
                >
                  <span className="font-poppins text-sm text-app1-text-muted">{row.label}</span>
                  <span
                    className={cn(
                      'font-poppins text-sm font-semibold tracking-wide text-app1-text-main',
                      'wide' in row && row.wide ? 'text-right sm:max-w-[60%]' : '',
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {timeLeft ? (
            <div
              className={cn(
                'mb-6 mt-6 flex items-center justify-between rounded-[10px] border p-4',
                isExpired
                  ? 'border-app1-danger/30 bg-app1-danger/10'
                  : timeLeft.hours < 6
                    ? 'border-app1-danger/30 bg-app1-danger/10'
                    : 'border-app1-secondary/30 bg-app1-secondary/5',
              )}
            >
              <div className="flex items-center gap-3">
                <Clock
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isExpired || timeLeft.hours < 6 ? 'text-app1-danger' : 'text-app1-secondary',
                  )}
                  strokeWidth={1.75}
                />
                <div>
                  <p
                    className={cn(
                      'font-poppins text-[13px] font-bold',
                      isExpired || timeLeft.hours < 6 ? 'text-app1-danger' : 'text-app1-text-main',
                    )}
                  >
                    {isExpired ? 'Signing window expired' : 'Time remaining to sign'}
                  </p>
                  <p className="mt-0.5 font-poppins text-[11px] text-app1-text-muted">
                    Contract must be signed within 24 hours of deal creation
                  </p>
                </div>
              </div>
              {!isExpired ? (
                <div className="font-cinzel text-[24px] font-bold tabular-nums text-app1-text-main">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="relative mt-6">
            <div className="contract-doc-scroll h-[300px] overflow-y-auto rounded-lg bg-app1-bg-soft p-6">
              <div className="space-y-4 text-sm leading-relaxed text-app1-text-muted">
                {ARTICLES.map((a) => (
                  <div key={a.title}>
                    <p className="mb-2 font-bold text-app1-text-main">{a.title}</p>
                    <p className={cn('mb-4', a.blur)}>{a.body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-24 items-end justify-center rounded-b-lg bg-gradient-to-t from-app1-bg-soft from-20% to-transparent pb-4"
              aria-hidden
            >
              <span className="rounded-full bg-app1-bg-card/80 px-3 py-1 text-center text-xs font-semibold text-app1-text-muted shadow-sm backdrop-blur-sm">
                Scroll to read full document
              </span>
            </div>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-start gap-3">
              <input
                id="tract-contract-agree"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={isExpired}
                className="mt-1 h-5 w-5 shrink-0 rounded border-app1-border-light text-app1-secondary focus:ring-app1-secondary"
              />
              <label htmlFor="tract-contract-agree" className="font-poppins text-sm text-app1-text-main">
                I, <span className="font-bold">{buyerDisplayName}</span>, have read and agree to all terms above,
                including the TRACT master services agreement and assignment protocols.
              </label>
            </div>

            <div className="relative rounded-lg border-2 border-dashed border-app1-secondary/30 bg-app1-bg-card p-6">
              <p className="mb-6 text-center font-poppins text-sm italic text-app1-text-muted">
                Click to sign with your TRACT verified signature
              </p>
              <div className="flex flex-col items-end justify-between gap-4 md:flex-row">
                <div className="mb-4 w-full text-center md:mb-0 md:text-left">
                  <span className="font-dancing text-4xl text-app1-text-main">{buyerDisplayName}</span>
                  <div className="mt-1 h-px w-full bg-app1-border-light" />
                  <p className="mt-1 font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">
                    Buyer electronic signature
                  </p>
                </div>
                <div className="w-full text-center md:w-auto md:text-right">
                  <span className="font-poppins text-sm font-semibold tracking-wide text-app1-text-main">
                    {executionDate}
                  </span>
                  <p className="mt-1 font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">
                    Date of execution
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={signed || isExpired}
              className="mt-6 flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-app1-premium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signed ? 'Contract signed' : 'Accept & sign contract'}
              <FileSignature className="h-5 w-5" strokeWidth={2} aria-hidden />
            </button>

            {isExpired ? (
              <p className="mt-4 text-center font-poppins text-[13px] text-app1-danger">
                The 24-hour signing window has expired. Please contact support to reactivate this contract.
              </p>
            ) : null}

            <div className="mt-4 text-center">
              <button
                type="button"
                className="font-poppins text-sm text-app1-text-muted underline transition-colors hover:text-app1-text-main"
                onClick={() => void downloadContract()}
              >
                Download Contract PDF
              </button>
            </div>
          </div>

          <div
            className={cn(
              'mt-10 border-t border-app1-border-light pt-6 transition-opacity',
              signed ? 'opacity-100' : 'opacity-50',
            )}
          >
            <p className="mb-2 text-center font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">
              Post-execution status preview
            </p>
            <div className="flex justify-center">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full border border-app1-primary/10 px-6 py-2 font-poppins text-sm font-bold text-app1-primary',
                  signed ? 'bg-app1-primary/10' : 'bg-app1-bg-soft text-app1-text-muted',
                )}
              >
                <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                Contract signed ✓
              </div>
            </div>
          </div>

          {signed ? (
            <div className="mt-8 border-t border-app1-border-light pt-6 text-center">
              <Link
                to={`/deals/${dealId}/title-company`}
                className="font-poppins text-sm font-semibold text-app1-secondary underline decoration-app1-secondary/50 underline-offset-4 transition-colors hover:text-app1-primary-dark"
              >
                Continue to title company selection
              </Link>
            </div>
          ) : null}
        </div>
        )}
      </div>

      <footer className="mt-10 border-t border-app1-border-light bg-app1-bg-card">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-12">
          <div className="font-cinzel text-xl font-black text-app1-primary">TRACT</div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link to="/legal/privacy" className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main">
              Privacy policy
            </Link>
            <Link to="/legal/terms" className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main">
              Terms of service
            </Link>
          </nav>
          <p className="text-center font-poppins text-sm text-app1-text-muted">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
      </main>
    </DashboardLayout>
  )
}
