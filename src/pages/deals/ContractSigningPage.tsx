import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CircleCheck, Clock, FileSignature, Loader2, ShieldCheck } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useDeal } from '@/hooks/useDeal'
import {
  useContractByListing,
  useCreateContractForListing,
  useOpenContractSigning,
} from '@/hooks/useContracts'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'
import type { MarketplaceContract, MarketplaceDeal, MarketplaceListing } from '@/types'

const SELLER_AVATAR = DEFAULT_AVATAR_IMAGE
const BUYER_AVATAR = DEFAULT_AVATAR_IMAGE

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

function listingIdFromDeal(deal: MarketplaceDeal | undefined): string | null {
  const raw = deal?.listingId
  if (!raw) return null
  if (typeof raw === 'string') return raw
  if (typeof raw === 'object' && '_id' in raw) return String(raw._id)
  return null
}

function propertyAddressLine(deal: MarketplaceDeal | undefined): string {
  const listing = listingFromDeal(deal)
  if (!listing?.propertyAddress) return 'Property Address Pending'
  return [listing.propertyAddress, listing.city, listing.stateCode].filter(Boolean).join(', ')
}

function partyName(
  party: MarketplaceContract['wholesalerId'] | MarketplaceContract['buyerId'] | undefined,
  fallback: string,
): string {
  if (party && typeof party === 'object') {
    return party.fullName?.trim() || fallback
  }
  return fallback
}

function contractStatusLabel(status: MarketplaceContract['status'] | undefined): string {
  if (status === 'signed') return 'Signed'
  if (status === 'cancelled') return 'Cancelled'
  return 'Pending signatures'
}

function listerBadgeLabel(
  contract: MarketplaceContract | null | undefined,
  viewerIsLister: boolean,
  viewerRole: string | undefined,
): string {
  if (contract && typeof contract.wholesalerId === 'object') {
    return contract.wholesalerId.role === 'realtor' ? 'Listing Realtor' : 'Wholesaler'
  }
  if (viewerIsLister) {
    return viewerRole === 'realtor' ? 'Listing Realtor' : 'Wholesaler'
  }
  return 'Lister'
}

function purchaserBadgeLabel(
  contract: MarketplaceContract | null | undefined,
  viewerIsPurchaser: boolean,
  viewerRole: string | undefined,
): string {
  if (contract && typeof contract.buyerId === 'object') {
    return contract.buyerId.role === 'realtor' ? 'Purchasing Realtor' : 'Buyer'
  }
  if (viewerIsPurchaser) {
    return viewerRole === 'realtor' ? 'Purchasing Realtor' : 'Buyer'
  }
  return 'Purchaser'
}

export default function ContractSigningPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: deal, isLoading } = useDeal(dealId)

  useEffect(() => {
    if (!dealId) {
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [dealId, navigate])

  const listingId = listingIdFromDeal(deal)
  const {
    data: contract,
    isLoading: isContractLoading,
    refetch: refetchContract,
  } = useContractByListing(listingId ?? undefined)

  const createContract = useCreateContractForListing(
    listingId ?? undefined,
    deal?.primaryBidId,
  )

  const [isWaitingForReturn, setIsWaitingForReturn] = useState(false)
  const openedSigningRef = useRef(false)
  const openSigning = useOpenContractSigning(contract?.id, () => {
    openedSigningRef.current = true
    setIsWaitingForReturn(true)
  })

  useEffect(() => {
    function handleWindowFocus() {
      if (!openedSigningRef.current) return
      openedSigningRef.current = false
      setIsWaitingForReturn(false)
      window.setTimeout(() => {
        void refetchContract()
      }, 1000)
    }

    window.addEventListener('focus', handleWindowFocus)
    return () => window.removeEventListener('focus', handleWindowFocus)
  }, [refetchContract])

  const userId = user?.id ?? ''
  const buyerDisplayName = user?.fullName?.trim() || user?.email?.split('@')[0] || ''
  const wholesalerName = deal?.wholesaler?.fullName?.trim() || deal?.wholesalerName || 'Lister'
  const contractRef = useMemo(() => contractRefFromDealId(dealId), [dealId])
  const address = propertyAddressLine(deal)

  const listing = listingFromDeal(deal)
  const marketPrice = listing?.assignmentFeeHigh ?? 45_000
  const isDealLister = Boolean(userId && deal?.wholesalerId === userId)
  const isDealPurchaser = Boolean(userId && deal?.primaryBuyerId === userId)
  const listerName = partyName(contract?.wholesalerId, wholesalerName)
  const purchaserName = partyName(
    contract?.buyerId,
    deal?.primaryBuyer?.fullName?.trim() || buyerDisplayName || 'Purchaser',
  )
  const listerBadge = listerBadgeLabel(contract, isDealLister, user?.role)
  const purchaserBadge = purchaserBadgeLabel(contract, isDealPurchaser, user?.role)

  const currentUserSide = contract
    ? typeof contract.wholesalerId === 'object' && contract.wholesalerId.id === userId
      ? 'lister'
      : typeof contract.buyerId === 'object' && contract.buyerId.id === userId
        ? 'purchaser'
        : isDealLister
          ? 'lister'
          : isDealPurchaser
            ? 'purchaser'
            : null
    : isDealLister
      ? 'lister'
      : isDealPurchaser
        ? 'purchaser'
        : null

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

  if (!dealId) return null

  const isBusy = isLoading || isContractLoading
  const hasContract = Boolean(contract)
  const currentUserHasSigned =
    currentUserSide === 'lister'
      ? Boolean(contract?.wholesalerSignedAt)
      : currentUserSide === 'purchaser'
        ? Boolean(contract?.buyerSignedAt)
        : false
  const otherPartyHasSigned =
    currentUserSide === 'lister'
      ? Boolean(contract?.buyerSignedAt)
      : currentUserSide === 'purchaser'
        ? Boolean(contract?.wholesalerSignedAt)
        : false

  const waitingForInitiation = !contract && currentUserSide === 'purchaser'
  const canCreateContract =
    !contract &&
    currentUserSide === 'lister' &&
    !isExpired &&
    Boolean(listingId && deal?.primaryBidId)
  const canSignContract =
    hasContract &&
    contract?.status === 'pending' &&
    !currentUserHasSigned &&
    !isExpired &&
    !isWaitingForReturn
  const showWaitingForOtherSignature =
    hasContract &&
    contract?.status === 'pending' &&
    currentUserHasSigned &&
    !otherPartyHasSigned

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
          {isBusy ? (
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
                    <p className="font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">
                      Lister
                    </p>
                    <p className="font-poppins text-base font-bold text-app1-text-main">{listerName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="rounded-full bg-app1-primary/10 px-2 py-0.5 font-poppins text-[10px] font-black text-app1-primary">
                        {listerBadge}
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
                    <p className="font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">
                      Purchaser
                    </p>
                    <p className="font-poppins text-base font-bold text-app1-text-main">{purchaserName}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="rounded-full bg-app1-primary/10 px-2 py-0.5 font-poppins text-[10px] font-black text-app1-primary">
                        {purchaserBadge}
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
                <div className="mb-6 flex items-center justify-between rounded-lg bg-app1-bg-soft px-4 py-3">
                  <div>
                    <p className="font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">
                      Contract status
                    </p>
                    <p className="font-poppins text-sm font-semibold text-app1-text-main">
                      {contractStatusLabel(contract?.status)}
                    </p>
                  </div>
                  {contract ? (
                    <div className="text-right text-xs text-app1-text-muted">
                      <p>Lister: {contract.wholesalerSignedAt ? 'Signed' : 'Pending'}</p>
                      <p>Purchaser: {contract.buyerSignedAt ? 'Signed' : 'Pending'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-app1-text-muted">Not yet initiated</p>
                  )}
                </div>

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

              <div className="mt-10">
                <div className="rounded-lg border border-app1-border-light bg-app1-bg-soft p-6">
                  {!listingId ? (
                    <p className="text-sm text-app1-danger">
                      Listing information is missing from this deal, so contract signing cannot be started.
                    </p>
                  ) : waitingForInitiation ? (
                    <div className="space-y-3">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Waiting for {listerName} to initiate the contract.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        The lister must create the contract first. Once created, your DocuSeal signing link will become available here.
                      </p>
                    </div>
                  ) : canCreateContract ? (
                    <div className="space-y-4">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Contract has not been created yet.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        Create the contract to generate the draft PDF and initialize DocuSeal for both parties.
                      </p>
                      <button
                        type="button"
                        onClick={() => void createContract.mutateAsync()}
                        disabled={createContract.isPending}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-app1-premium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {createContract.isPending ? 'Creating contract...' : 'Create Contract'}
                        <FileSignature className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  ) : contract?.status === 'cancelled' ? (
                    <p className="text-sm font-semibold text-app1-danger">
                      This contract has been cancelled.
                    </p>
                  ) : contract?.status === 'signed' ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-app1-primary/20 bg-app1-primary/10 px-4 py-3">
                        <p className="font-poppins text-sm font-semibold text-app1-primary">
                          Contract fully executed.
                        </p>
                      </div>
                      {contract.signedPdfUrl ? (
                        <a
                          href={contract.signedPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-poppins text-sm font-semibold text-app1-secondary underline"
                        >
                          View signed contract PDF
                        </a>
                      ) : (
                        <p className="text-sm text-app1-text-muted">
                          The signed PDF is still being finalized. Please refresh shortly.
                        </p>
                      )}
                    </div>
                  ) : showWaitingForOtherSignature ? (
                    <div className="space-y-3">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Your signature has been completed.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        Waiting for {currentUserSide === 'lister' ? purchaserName : listerName} to sign.
                      </p>
                    </div>
                  ) : canSignContract ? (
                    <div className="space-y-4">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Ready to sign with DocuSeal.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        Your signing session opens in a new tab, matching the existing App1 DocuSeal flow.
                      </p>
                      <button
                        type="button"
                        onClick={() => void openSigning.mutateAsync()}
                        disabled={openSigning.isPending || isWaitingForReturn}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-app1-premium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {openSigning.isPending
                          ? 'Opening DocuSeal...'
                          : isWaitingForReturn
                            ? 'Waiting for return'
                            : 'Open DocuSeal Signing'}
                        <FileSignature className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-app1-text-muted">
                      This contract is not currently actionable from your side.
                    </p>
                  )}
                </div>

                {isExpired ? (
                  <p className="mt-4 text-center font-poppins text-[13px] text-app1-danger">
                    The 24-hour signing window has expired. Contract creation and signing actions are now disabled.
                  </p>
                ) : null}

                {contract?.pdfUrl ? (
                  <div className="mt-4 text-center">
                    <a
                      href={contract.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-poppins text-sm text-app1-text-muted underline transition-colors hover:text-app1-text-main"
                    >
                      View draft contract PDF
                    </a>
                  </div>
                ) : null}
              </div>

              <div
                className={cn(
                  'mt-10 border-t border-app1-border-light pt-6 transition-opacity',
                  contract?.status === 'signed' ? 'opacity-100' : 'opacity-50',
                )}
              >
                <p className="mb-2 text-center font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">
                  Post-execution status preview
                </p>
                <div className="flex justify-center">
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-full border border-app1-primary/10 px-6 py-2 font-poppins text-sm font-bold text-app1-primary',
                      contract?.status === 'signed'
                        ? 'bg-app1-primary/10'
                        : 'bg-app1-bg-soft text-app1-text-muted',
                    )}
                  >
                    <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                    Contract signed ✓
                  </div>
                </div>
              </div>

              {contract?.status === 'signed' ? (
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
      </main>
    </DashboardLayout>
  )
}
