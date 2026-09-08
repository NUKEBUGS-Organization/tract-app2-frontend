import SubscriptionGate from '@/components/payments/SubscriptionGate'
import ContractDisclosure from '@/components/legal/ContractDisclosure'
import { useContractSocket } from '@/hooks/useSocket'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck, FileSignature, Loader2, ShieldCheck } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useDeal } from '@/hooks/useDeal'
import { useListing } from '@/hooks/useListings'
import {
  useCancelContract,
  useContractByListing,
  useCreateContractForListing,
  useOpenContractSigning,
  useUploadSignedContract,
} from '@/hooks/useContracts'
import { useAuthStore } from '@/store/authStore'
import { isListerRole, roleHomePath } from '@/lib/roleHome'
import api from '@/lib/api'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { mapApiDeal } from '@/lib/mapDeal'
import type { ApiResponse, MarketplaceContract, MarketplaceDeal, MarketplaceListing } from '@/types'

function PartyAvatar({ src, name }: { src?: string | null; name: string }) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'
  return src && failedSrc !== src
    ? <img src={src} alt={`${name} profile`} onError={() => setFailedSrc(src)} className="h-12 w-12 shrink-0 rounded-full border border-app1-primary/20 object-cover" />
    : <span aria-label={`${name} profile`} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-app1-primary font-semibold text-white">{initials}</span>
}

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
  buyerId?: { fullName?: string; _id?: string; id?: string; role?: string; avatarUrl?: string | null } | string
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
    queryKey: ['bids', 'signing', listingId, user?.id, user?.role],
    queryFn: async () => {
      if (user?.role === 'buyer') {
        const { data } = await api.get<ApiResponse<(ListingBid & { listingId?: string | { _id?: string; id?: string } })[]>>('/bids/mine')
        return (data.data ?? []).filter((bid) => {
          const id = typeof bid.listingId === 'object' ? bid.listingId?._id ?? bid.listingId?.id : bid.listingId
          return id === listingId
        })
      }
      const { data } = await api.get<ApiResponse<ListingBid[]>>(`/bids/listing/${listingId}`)
      return (data.data ?? []) as ListingBid[]
    },
    enabled: Boolean(listingId && user && (user.role === 'buyer' || user.role === 'admin' ||
      (isListerRole(user.role) && listing?.wholesalerId === user.id))),
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

  useContractSocket(listingId)
  const [disclosureAccepted, setDisclosureAccepted] = useState(false)
  const createContract = useCreateContractForListing(listingId, primaryBidId)
  const [contractFile, setContractFile] = useState<File>()
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false)
  const [buyerFile, setBuyerFile] = useState<File>()
  const [buyerSignedConfirmed, setBuyerSignedConfirmed] = useState(false)
  const uploadSigned = useUploadSignedContract(contract?.id, listingId)
  const selectPdf = (file: File | undefined, setter: (file: File | undefined) => void) => {
    if (file && (!file.name.toLowerCase().endsWith('.pdf') || file.size > 10 * 1024 * 1024)) { toast.error('Choose a PDF no larger than 10 MB.'); setter(undefined); return }
    setter(file)
  }
  const cancelContract = useCancelContract(listingId)

  const [isWaitingForReturn, setIsWaitingForReturn] = useState(false)
  const openedSigningRef = useRef(false)
  const openSigning = useOpenContractSigning(contract?.id, () => {
    openedSigningRef.current = true
    setIsWaitingForReturn(true)
  })

  useEffect(() => {
    function refreshAfterSigning() {
      if (!openedSigningRef.current) return
      openedSigningRef.current = false
      setIsWaitingForReturn(true)
      window.setTimeout(() => {
        void refetchContract()
        setIsWaitingForReturn(false)
      }, 800)
    }

    function handleWindowFocus() {
      refreshAfterSigning()
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        refreshAfterSigning()
      }
    }

    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [refetchContract])

  // Keep polling while waiting for DocuSeal return / counterpart signature
  useEffect(() => {
    if (!isWaitingForReturn && contract?.status !== 'pending') return
    const id = window.setInterval(() => {
      void refetchContract()
    }, 2_000)
    return () => window.clearInterval(id)
  }, [isWaitingForReturn, contract?.status, refetchContract])

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
      navigate(roleHomePath(user?.role), { replace: true })
    }
  }, [listingIdParam, dealId, navigate, user?.role])

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
    listing?.wholesaler?.fullName?.trim() ||
    (isDealLister ? user?.fullName?.trim() : undefined) ||
    dealFromRoute?.wholesaler?.fullName?.trim() ||
    dealFromRoute?.wholesalerName ||
    'Lister'
  const buyerDisplayName = isDealPurchaser ? user?.fullName?.trim() || user?.email?.split('@')[0] || '' : ''
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
  const listerBadge = listing?.wholesaler?.role === 'realtor' ? 'Listing Realtor' : listerBadgeLabel(contract, isDealLister, user?.role)
  const purchaserBadge = purchaserBadgeLabel(contract, isDealPurchaser, user?.role)
  const listerAvatar = (isDealLister ? user?.avatarUrl : undefined) || (typeof contract?.wholesalerId === 'object' ? contract.wholesalerId.avatarUrl : undefined) || listing?.wholesaler?.avatarUrl || dealFromRoute?.wholesaler?.avatarUrl
  const purchaserAvatar = (isDealPurchaser ? user?.avatarUrl : undefined) || (typeof contract?.buyerId === 'object' ? contract.buyerId.avatarUrl : undefined) || (typeof primaryBid?.buyerId === 'object' ? primaryBid.buyerId.avatarUrl : undefined) || dealFromRoute?.primaryBuyer?.avatarUrl
  const isRealtorListing = (isDealLister && user?.role === 'realtor') || listing?.wholesaler?.role === 'realtor'
  const isManualContract = contract?.signingMethod === 'manual'

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
        { label: 'Agreed property price', value: formatCurrency(marketPrice) },
        ...(user?.role !== 'buyer'
          ? [{ label: 'EMD', value: formatCurrency(primaryBid?.emdAmount ?? 0) }]
          : []),
        { label: 'Inspection period', value: 'Per bid / agreement' },
        { label: 'Due diligence', value: 'Per bid / agreement' },
        {
          label: 'Signing order',
          value: 'Lister signs first, then purchaser.',
          wide: true,
        },
      ] as const,
    [marketPrice, primaryBid?.emdAmount, user?.role],
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
    !isManualContract &&
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
    <DashboardLayout sidebar={isListerRole(user?.role) ? <WholesalerSidebar /> : <Sidebar />}>
      <main className="min-h-screen bg-app1-bg-main p-6 md:p-10">
        <header className="sticky top-0 z-40 -mx-6 w-full border-b border-app1-border-light bg-app1-bg-card md:-mx-10">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
            <Link to={roleHomePath(user?.role)} className="font-cinzel text-2xl font-black text-app1-primary">
              TRACT
            </Link>
            <p className="font-poppins text-base text-app1-text-muted">Contract #{contractRef}</p>
          </div>
        </header>

        <div className="w-full border-b border-app1-primary/20 bg-app1-primary/10 py-2">
          <div className="mx-auto max-w-[800px] text-center">
            <span className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-primary">
              Agreement review &amp; signing
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
                  <PartyAvatar src={listerAvatar} name={listerName} />
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
                  <PartyAvatar src={purchaserAvatar} name={purchaserName} />
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
                        {isRealtorListing ? 'The realtor will upload their brokerage agreement. Once they sign the signature page, your signing link unlocks here.' : 'The lister must prepare the contract first. Your signing link unlocks after they sign.'}
                      </p>
                    </div>
                  ) : canCreateContract ? (
                    <div className="space-y-4">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Contract has not been created yet.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        {user?.role === 'realtor'
                          ? 'Upload your brokerage agreement as a PDF. It is stored exactly as uploaded, and a signature page is attached for you and the buyer to sign here.'
                          : 'Create the agreement for both parties to review and sign.'}
                      </p>
                      {user?.role === 'realtor' && <label className="mb-4 block text-sm">Contract PDF (maximum 10 MB)
                        <input type="file" accept="application/pdf,.pdf" className="mt-2 block w-full" onChange={(event) => selectPdf(event.target.files?.[0], setContractFile)} />
                      </label>}
                      <SubscriptionGate><ContractDisclosure checked={disclosureAccepted} onChange={setDisclosureAccepted} /><button
                        type="button"
                        onClick={() => user?.role === 'realtor' ? setShowUploadConfirmation(true) : createContract.mutate(undefined)}
                        disabled={!disclosureAccepted || createContract.isPending || (user?.role === 'realtor' && !contractFile)}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-app1-premium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {createContract.isPending ? 'Creating contract...' : user?.role === 'realtor' ? 'Upload contract' : 'Create Contract'}
                        <FileSignature className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </button></SubscriptionGate>
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
                          The signed PDF is being finalized. This page updates automatically.
                        </p>
                      )}
                      {!activeDealId ? (
                        <p className="flex items-center gap-2 text-sm text-app1-text-muted">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Creating deal from signed contract…
                        </p>
                      ) : null}
                    </div>
                  ) : isManualContract && currentUserSide === 'purchaser' && !contract.buyerSignedAt ? (
                    <div className="space-y-4">
                      <h2 className="font-semibold">Download, sign and return the agreement</h2>
                      <p className="text-sm text-app1-text-muted">The realtor has signed this contract. Download the PDF, add your signature offline and upload the complete agreement with both signatures.</p>
                      {contract.pdfUrl && <a href={contract.pdfUrl} target="_blank" rel="noreferrer" className="inline-block text-app1-primary underline">Download realtor-signed contract</a>}
                      <label className="block text-sm">Final signed contract PDF (maximum 10 MB)
                        <input type="file" accept="application/pdf,.pdf" className="mt-2 block w-full" onChange={(event) => selectPdf(event.target.files?.[0], setBuyerFile)} />
                      </label>
                      <SubscriptionGate>
                        <ContractDisclosure checked={disclosureAccepted} onChange={setDisclosureAccepted} />
                        <label className="my-4 flex items-start gap-2 text-sm"><input type="checkbox" checked={buyerSignedConfirmed} onChange={(event) => setBuyerSignedConfirmed(event.target.checked)} />I confirm this PDF contains my signature and the realtor's signature.</label>
                        <button type="button" disabled={!buyerFile || !buyerSignedConfirmed || !disclosureAccepted || uploadSigned.isPending} onClick={() => buyerFile && uploadSigned.mutate(buyerFile)} className="w-full rounded-xl bg-app1-secondary px-4 py-3 font-semibold text-app1-primary-dark disabled:opacity-50">{uploadSigned.isPending ? 'Uploading contract...' : 'Upload final signed contract'}</button>
                      </SubscriptionGate>
                    </div>
                  ) : purchaserWaitingForLister ? (
                    <div className="space-y-3">
                      <p className="font-poppins text-sm font-semibold text-app1-text-main">
                        Waiting for {listerName} to sign first.
                      </p>
                      <p className="text-sm text-app1-text-muted">
                        The lister signs before the purchaser can open their signing link.
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
                      <SubscriptionGate><ContractDisclosure checked={disclosureAccepted} onChange={setDisclosureAccepted} /><button
                        type="button"
                        onClick={() => void openSigning.mutateAsync()}
                        disabled={!disclosureAccepted || openSigning.isPending || isWaitingForReturn}
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
                      </button></SubscriptionGate>
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
                      {isManualContract ? 'View realtor-signed contract PDF' : 'View contract PDF'}
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
                            isListerRole(user?.role)
                              ? `/wholesaler/listings/${listingId}`
                              : roleHomePath(user?.role),
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
                    to={`/deals/${activeDealId}`}
                    className="font-poppins text-sm font-semibold text-app1-secondary underline decoration-app1-secondary/50 underline-offset-4 transition-colors hover:text-app1-primary-dark"
                  >
                    Continue to deal tracker
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </div>
        <Dialog open={showUploadConfirmation} onOpenChange={setShowUploadConfirmation}>
          <DialogContent className="bg-app1-bg-card text-app1-text-main">
            <DialogTitle>Confirm your contract</DialogTitle>
            <DialogDescription>Upload the agreement your brokerage uses for this property. Your original file is never modified.</DialogDescription>
            <p className="text-sm text-app1-text-muted">A signature page will be attached to {contractFile?.name}. You sign the seller fields first, then the buyer signs.</p>
            <button type="button" disabled={!contractFile || createContract.isPending} onClick={() => createContract.mutate(contractFile, { onSuccess: () => setShowUploadConfirmation(false) })} className="rounded-xl bg-app1-secondary px-4 py-3 font-semibold text-app1-primary-dark disabled:opacity-50">{createContract.isPending ? 'Uploading...' : 'Upload and prepare for signing'}</button>
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  )
}
