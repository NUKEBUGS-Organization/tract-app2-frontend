import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck, FileSignature, Loader2, ShieldCheck } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useDeal } from '@/hooks/useDeal'
import { useListing } from '@/hooks/useListings'
import {
  useCancelContract,
  useContractByListing,
  useCreateContractForListing,
  useOpenContractSigning,
} from '@/hooks/useContracts'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'
import { mapApiDeal } from '@/lib/mapDeal'
import type { ApiResponse, MarketplaceContract, MarketplaceDeal, MarketplaceListing } from '@/types'

const SELLER_AVATAR = DEFAULT_AVATAR_IMAGE
const BUYER_AVATAR = DEFAULT_AVATAR_IMAGE

function contractRefFromId(id: string | undefined): string {
  if (!id) return 'C-PENDING'
  const slug = id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()
  return slug ? `C-${slug}` : 'C-PENDING'
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

type ListingBid = {
  _id?: string
  id?: string
  buyerId?: { fullName?: string; _id?: string; id?: string; role?: string } | string
  assignmentPrice?: number
  emdAmount?: number
  status?: string
}

export default function ContractSigningPage() {
  const { listingId: listingIdParam, dealId } = useParams<{
    listingId?: string
    dealId?: string
  }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: dealFromRoute, isLoading: isDealLoading } = useDeal(dealId)
  const listingId = listingIdParam ?? listingIdFromDeal(dealFromRoute) ?? undefined

  const { data: listing, isLoading: isListingLoading } = useListing(listingId)
  const {
    data: contract,
    isLoading: isContractLoading,
    refetch: refetchContract,
  } = useContractByListing(listingId)

  const { data: bids = [] } = useQuery({
    queryKey: ['bids', 'listing', listingId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ListingBid[]>>(`/bids/listing/${listingId}`)
      return (data.data ?? []) as ListingBid[]
    },
    enabled: Boolean(listingId),
  })

  const primaryBid = useMemo(
    () => bids.find((b) => b.status === 'primary') ?? null,
    [bids],
  )
  const primaryBidId =
    contract?.bidId ??
    primaryBid?.id ??
    primaryBid?._id ??
    dealFromRoute?.primaryBidId

  const createContract = useCreateContractForListing(listingId, primaryBidId)
  const cancelContract = useCancelContract(listingId)

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

  const { data: linkedDeal } = useQuery({
    queryKey: ['deal', 'listing', listingId, 'after-sign'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>(
        `/deals?listingId=${listingId}`,
      )
      const rows = Array.isArray(data.data) ? data.data : []
      if (!rows.length) return null
      return mapApiDeal(rows[0] as Record<string, unknown>)
    },
    enabled: Boolean(listingId && contract?.status === 'signed'),
    refetchInterval: (query) => (query.state.data ? false : 2000),
  })

  const activeDealId = dealId ?? linkedDeal?.id ?? dealFromRoute?.id

  useEffect(() => {
    if (!listingIdParam && !dealId) {
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [listingIdParam, dealId, navigate])

  const userId = user?.id ?? ''
  const listingWholesalerId = listing?.wholesalerId ?? dealFromRoute?.wholesalerId

  const primaryBuyerId =
    primaryBid && typeof primaryBid.buyerId === 'object'
      ? String(primaryBid.buyerId._id ?? primaryBid.buyerId.id ?? '')
      : primaryBid
        ? String(primaryBid.buyerId ?? '')
        : dealFromRoute?.primaryBuyerId

  const isDealLister = Boolean(
    userId && (listingWholesalerId === userId || dealFromRoute?.wholesalerId === userId),
  )
  const isDealPurchaser = Boolean(
    userId && (primaryBuyerId === userId || dealFromRoute?.primaryBuyerId === userId),
  )

  const wholesalerName =
    dealFromRoute?.wholesaler?.fullName?.trim() ||
    dealFromRoute?.wholesalerName ||
    'Lister'
  const buyerDisplayName = user?.fullName?.trim() || user?.email?.split('@')[0] || ''
  const contractRef = useMemo(
    () => contractRefFromId(contract?.id ?? listingId ?? dealId),
    [contract?.id, listingId, dealId],
  )

  const address = useMemo(() => {
    if (listing?.propertyAddress) {
      return [listing.propertyAddress, listing.city, listing.stateCode].filter(Boolean).join(', ')
    }
    const fromDeal = listingFromDeal(dealFromRoute)
    if (fromDeal?.propertyAddress) {
      return [fromDeal.propertyAddress, fromDeal.city, fromDeal.stateCode]
        .filter(Boolean)
        .join(', ')
    }
    return 'Property Address Pending'
  }, [listing, dealFromRoute])

  const marketPrice =
    contract?.assignmentFeeFinal ||
    primaryBid?.assignmentPrice ||
    listing?.assignmentFeeHigh ||
    listingFromDeal(dealFromRoute)?.assignmentFeeHigh ||
    0

  const listerName = partyName(contract?.wholesalerId, wholesalerName)
  const purchaserName = partyName(
    contract?.buyerId,
    (primaryBid && typeof primaryBid.buyerId === 'object'
      ? primaryBid.buyerId.fullName
      : undefined) ||
      dealFromRoute?.primaryBuyer?.fullName?.trim() ||
      buyerDisplayName ||
      'Purchaser',
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
        { label: 'Assignment price', value: formatCurrency(marketPrice) },
        { label: 'EMD', value: formatCurrency(primaryBid?.emdAmount ?? 0) },
        { label: 'Inspection period', value: 'Per bid / agreement' },
        { label: 'Due diligence', value: 'Per bid / agreement' },
        {
          label: 'Signing order',
          value: 'Lister signs first, then purchaser (App1 DocuSeal flow).',
          wide: true,
        },
      ] as const,
    [marketPrice, primaryBid?.emdAmount],
  )

  if (!listingIdParam && !dealId) return null

  const isBusy = isDealLoading || isListingLoading || isContractLoading
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
    !contract && currentUserSide === 'lister' && Boolean(listingId && primaryBidId)

  // App1-style: purchaser cannot open DocuSeal until lister has signed.
  const purchaserWaitingForLister =
    hasContract &&
    contract?.status === 'pending' &&
    currentUserSide === 'purchaser' &&
    !contract.wholesalerSignedAt

  const canSignContract =
    hasContract &&
    contract?.status === 'pending' &&
    !currentUserHasSigned &&
    !isWaitingForReturn &&
    !purchaserWaitingForLister &&
    (currentUserSide === 'lister' ||
      (currentUserSide === 'purchaser' && Boolean(contract.wholesalerSignedAt)))

  const showWaitingForOtherSignature =
    hasContract &&
    contract?.status === 'pending' &&
    currentUserHasSigned &&
    !otherPartyHasSigned

  const canCancel =
    hasContract &&
    contract?.status === 'pending' &&
    (currentUserSide === 'lister' || currentUserSide === 'purchaser' || user?.role === 'admin')

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
              Document generation &amp; signing — App1 DocuSeal flow
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

              <div className="mt-10">
                <div className="rounded-lg border border-app1-border-light bg-app1-bg-soft p-6">
                  {!listingId ? (
                    <p className="text-sm text-app1-danger">
                      Listing information is missing, so contract signing cannot be started.
                    </p>
                  ) : waitingForInitiation ? (
                    <div className="space-y-3">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Waiting for {listerName} to create the contract.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        The lister must generate the contract first (same as App1 seller Create Contract). Your DocuSeal link unlocks after they sign.
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
                          Contract fully executed. Deal pipeline is activating…
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
                      {!activeDealId ? (
                        <p className="flex items-center gap-2 text-sm text-app1-text-muted">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Creating deal from signed contract…
                        </p>
                      ) : null}
                    </div>
                  ) : purchaserWaitingForLister ? (
                    <div className="space-y-3">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Waiting for {listerName} to sign first.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        Matching App1: the lister completes DocuSeal before the purchaser can open their signing link.
                      </p>
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
                        Your signing session opens in a new tab. Return here afterward — status refreshes automatically.
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
                            : currentUserSide === 'lister'
                              ? 'Sign As Lister'
                              : 'Sign Agreement'}
                        <FileSignature className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-app1-text-muted">
                      This contract is not currently actionable from your side.
                    </p>
                  )}
                </div>

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

                {canCancel && contract?.id ? (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      disabled={cancelContract.isPending}
                      onClick={() => {
                        if (!window.confirm('Cancel this contract and reopen the listing for bids?')) {
                          return
                        }
                        void cancelContract.mutateAsync(contract.id).then(() => {
                          navigate(
                            user?.role === 'wholesaler' || user?.role === 'realtor'
                              ? `/wholesaler/listings/${listingId}`
                              : '/buyer/dashboard',
                          )
                        })
                      }}
                      className="font-poppins text-sm font-semibold text-app1-danger underline disabled:opacity-50"
                    >
                      {cancelContract.isPending ? 'Cancelling…' : 'Cancel contract'}
                    </button>
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
                  Post-execution status
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

              {contract?.status === 'signed' && activeDealId ? (
                <div className="mt-8 space-y-3 border-t border-app1-border-light pt-6 text-center">
                  <Link
                    to={`/deals/${activeDealId}/title-company`}
                    className="block font-poppins text-sm font-semibold text-app1-secondary underline decoration-app1-secondary/50 underline-offset-4 transition-colors hover:text-app1-primary-dark"
                  >
                    Continue to title company selection
                  </Link>
                  <Link
                    to={`/deals/${activeDealId}`}
                    className="block font-poppins text-sm text-app1-text-muted underline"
                  >
                    Open deal tracker
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
