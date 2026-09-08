import { SubscriptionPanel } from '@/components/payments/SubscriptionGate'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Bell,
  Check,
  Download,
  Loader2,
  MessageCircle,
  Settings,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import VaultSection from '@/components/vault/VaultSection'
import TrackerStep from '@/components/app1/TrackerStep'
import StatCard from '@/components/app1/StatCard'
import StatusPill from '@/components/app1/StatusPill'
import { useAdvanceStep, useDeal, useUploadMarketingProof, useTitleHandling, useTitlePackage } from '@/hooks/useDeal'
import { useAdminTitleReps, useReassignTitleRep } from '@/hooks/useAdmin'
import { useClosedApp1Deals } from '@/hooks/useWholesaler'
import { useContractPdf, useEmdPdf } from '@/hooks/usePdf'
import { useDealSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/store/authStore'
import { isListerRole, roleHomePath } from '@/lib/roleHome'
import type { DealStep } from '@/types'
import { DEAL_STEP_ORDER, BUYER_ADVANCE_STEPS } from '@/types'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { formatTimeInStep, getCurrentStepEnteredAt } from '@/lib/dealStepTiming'
import { toast } from 'sonner'

const STEP_LABELS: Record<DealStep, string> = {
  contract_signed: 'Contract signed',
  emd_deposited: 'EMD deposited',
  inspection_period: 'Inspection period',
  appraisal_ordered: 'Appraisal ordered',
  financing_approved: 'Financing approved',
  title_search_complete: 'Title search',
  clear_to_close: 'Clear to close',
  funded_closed: 'Funded & closed',
}

function listingAddressLine(listing: unknown): string {
  if (listing && typeof listing === 'object') {
    const l = listing as Record<string, unknown>
    const addr = String(l.propertyAddress ?? '')
    const city = String(l.city ?? '')
    const st = String(l.stateCode ?? '')
    const parts = [addr, city, st].filter(Boolean)
    if (parts.length > 0) return parts.join(', ')
  }
  return 'Deal pipeline'
}

function dealLabel(dealId: string): string {
  return `#Deal-${dealId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'TRACT'}`
}

export default function DealTrackerPage() {
  const { id: dealId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!dealId) {
      navigate(roleHomePath(user?.role), { replace: true })
    }
  }, [dealId, navigate, user?.role])

  const { data: deal, isLoading, isError } = useDeal(dealId)
  const canViewSellerFinancials = user?.role === 'admin' || user?.role === 'title_rep' || Boolean(user?.id && deal?.wholesalerId === user.id)
  const stepLabel = (step: DealStep) => step === 'emd_deposited' && !canViewSellerFinancials ? 'Seller confirmation' : STEP_LABELS[step]
  const advanceStep = useAdvanceStep(dealId)
  const titleHandling = useTitleHandling(dealId)
  const titlePackage = useTitlePackage(dealId)
  const [showTitleChoice, setShowTitleChoice] = useState(false)
  const uploadProof = useUploadMarketingProof(dealId)
  const proofFileInputRef = useRef<HTMLInputElement>(null)
  const downloadContract = useContractPdf(dealId)
  const downloadEmd = useEmdPdf(dealId)

  useDealSocket(dealId)

  const [remainSec, setRemainSec] = useState(0)

  useEffect(() => {
    if (!deal?.marketingProofDeadline || deal.marketingProofUploaded) {
      setRemainSec(0)
      return
    }
    const tick = () => {
      const end = new Date(deal.marketingProofDeadline!).getTime()
      setRemainSec(Math.max(0, Math.floor((end - Date.now()) / 1000)))
    }
    tick()
    const t = window.setInterval(tick, 1000)
    return () => window.clearInterval(t)
  }, [deal?.marketingProofDeadline, deal?.marketingProofUploaded])

  const dealRef = useMemo(() => (dealId ? dealLabel(dealId) : ''), [dealId])

  const listingDoc = useMemo(() => {
    const lid = deal?.listingId
    if (lid && typeof lid === 'object') return lid as Record<string, unknown>
    return null
  }, [deal?.listingId])

  const app1DealId = useMemo(() => {
    const raw = listingDoc?.app1DealId
    if (raw == null || String(raw).trim() === '') return null
    return String(raw)
  }, [listingDoc])

  const canFetchClosedApp1 =
    Boolean(app1DealId) &&
    (user?.role === 'wholesaler' || user?.role === 'realtor')

  const { data: closedApp1Deals = [] } = useClosedApp1Deals({
    enabled: canFetchClosedApp1,
  })

  const acquisition = useMemo(() => {
    if (!app1DealId) return null

    const fromApp1 = closedApp1Deals.find((d) => d.dealId === app1DealId)
    const addressFromListing = listingAddressLine(listingDoc)
    const purchaseFromListing =
      listingDoc?.purchasePrice != null ? Number(listingDoc.purchasePrice) : 0

    return {
      address:
        fromApp1?.listingAddress?.trim() ||
        fromApp1?.address?.trim() ||
        addressFromListing,
      purchasePrice:
        fromApp1 && fromApp1.purchasePrice > 0
          ? fromApp1.purchasePrice
          : purchaseFromListing,
      closedAt: fromApp1?.closedAt?.trim() || null,
    }
  }, [app1DealId, closedApp1Deals, listingDoc])

  const pipelineSteps = useMemo(() => {
    if (!deal) return []
    const ci = DEAL_STEP_ORDER.indexOf(deal.currentStep)
    const safe = ci < 0 ? 0 : ci
    const lastIdx = DEAL_STEP_ORDER.length - 1
    const fullyClosed = deal.currentStep === 'funded_closed'
    const enteredAt = getCurrentStepEnteredAt(deal.currentStep, deal, deal.createdAt)
    const timeInStep = enteredAt ? formatTimeInStep(enteredAt) : null
    return DEAL_STEP_ORDER.map((stepKey, i) => {
      const complete = i < safe || (fullyClosed && i === lastIdx)
      const active = !complete && i === safe
      return {
        id: stepKey,
        label: stepKey === 'emd_deposited' && !canViewSellerFinancials ? 'Seller confirmation' : STEP_LABELS[stepKey],
        state: complete
          ? ('complete' as const)
          : active
            ? ('active' as const)
            : ('locked' as const),
        timeInStep: active ? timeInStep : null,
      }
    })
  }, [deal, canViewSellerFinancials])

  const currentIdx = deal ? DEAL_STEP_ORDER.indexOf(deal.currentStep) : -1
  const safeIdx = currentIdx < 0 ? 0 : currentIdx
  const linePct = DEAL_STEP_ORDER.length > 1 ? (safeIdx / (DEAL_STEP_ORDER.length - 1)) * 100 : 0

  const nextStep: DealStep | null =
    deal && safeIdx >= 0 && safeIdx < DEAL_STEP_ORDER.length - 1 ? DEAL_STEP_ORDER[safeIdx + 1] : null

  const adminHandlesNextStep = deal?.titleHandling === 'tract' &&
    (nextStep === 'clear_to_close' || nextStep === 'funded_closed')
  const canAdvanceThisUser = Boolean(
    user &&
      nextStep &&
      (user.role === 'admin' ||
        (!adminHandlesNextStep && (BUYER_ADVANCE_STEPS.has(nextStep)
          ? deal?.primaryBuyerId === user.id
          : deal?.wholesalerId === user.id))),
  )

  // ponytail: title flow hidden — do not gate advances on title rep
  const hasTitleRep = Boolean(deal?.titleRepId || deal?.titleRepName || deal?.titleRep?.fullName)

  const isAdmin = user?.role === 'admin'
  const { data: titleReps = [] } = useAdminTitleReps(isAdmin)
  const reassignTitleRep = useReassignTitleRep()
  const [selectedTitleRepId, setSelectedTitleRepId] = useState('')

  const deadlineLabel = useMemo(() => {
    const h = Math.floor(remainSec / 3600)
    const m = Math.floor((remainSec % 3600) / 60)
    const s = remainSec % 60
    return `${h}h ${m}m ${s}s`
  }, [remainSec])

  const killUrgent = remainSec > 0 && remainSec < 6 * 3600
  const killWarning = remainSec > 0 && remainSec < 24 * 3600

  const onAdvance = () => {
    if (!nextStep || !canAdvanceThisUser) return
    if (nextStep === 'title_search_complete' && !deal?.titleHandling) {
      setShowTitleChoice(true)
      return
    }
    advanceStep.mutate(nextStep)
  }

  const onUploadProofClick = () => {
    proofFileInputRef.current?.click()
  }

  const onProofFileSelected = (files: FileList | null) => {
    const file = files?.[0]
    if (proofFileInputRef.current) proofFileInputRef.current.value = ''
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Choose a PDF no larger than 10 MB.')
      return
    }
    if (file.type && file.type !== 'application/pdf') {
      toast.error('Choose a PDF no larger than 10 MB.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Choose a PDF no larger than 10 MB.')
      return
    }
    uploadProof.mutate(file)
  }

  if (!dealId) return null

  void linePct // retained per pipeline logic; horizontal stepper removed

  return (
    <DashboardLayout sidebar={isAdmin ? <AdminSidebar /> : isListerRole(user?.role) ? <WholesalerSidebar /> : <Sidebar />}>
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-app1-bg-main font-poppins text-app1-text-main">
        {deal?.disputeFrozen ? (
          <div className="flex w-full items-center justify-center gap-3 bg-[#ffb4ab] py-4 font-poppins text-sm font-black uppercase tracking-widest text-[#690005]">
            <span aria-hidden>!</span>
            Deal frozen — dispute in progress
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" aria-hidden />
          </div>
        ) : isError || !deal ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center font-poppins text-app1-text-muted">
            <p>Unable to load this deal.</p>
            <Link to={roleHomePath(user?.role)} className="text-app1-secondary underline">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <header className="flex h-20 shrink-0 items-center justify-between border-b border-app1-border-light bg-app1-bg-card px-4 md:px-12">
              <div className="min-w-0 flex flex-col">
                <h1 className="truncate font-cinzel text-xl font-black text-app1-primary md:text-[22px]">
                  {listingAddressLine(deal.listingId)}
                </h1>
                <p className="font-poppins text-[12px] font-bold tracking-wide text-app1-text-muted">{dealRef}</p>
              </div>
              <div className="hidden items-center gap-6 lg:flex">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-app1-border-light bg-app1-bg-soft font-poppins text-[10px] font-black text-app1-text-muted">
                      {deal.primaryBuyer.fullName.slice(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold leading-tight text-app1-text-main">{deal.primaryBuyer.fullName}</span>
                      <span className="text-[11px] font-medium leading-tight text-app1-text-muted">Buyer</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-app1-border-light bg-app1-bg-soft font-poppins text-[10px] font-black text-app1-text-muted">
                      {(deal.wholesaler?.fullName ?? 'W').slice(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold leading-tight text-app1-text-main">
                        {deal.wholesaler?.fullName ?? 'Wholesaler'}
                      </span>
                      <span className="text-[11px] font-medium leading-tight text-app1-text-muted">Wholesaler</span>
                    </div>
                  </div>
                  {/* ponytail: re-enable title rep person card when AI title rep ships */}                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  to={`/deals/${dealId}/rating`}
                  className="hidden rounded-full border border-app1-secondary/40 px-3 py-1.5 font-poppins text-xs font-bold text-app1-secondary transition-colors hover:bg-app1-secondary/10 sm:inline-flex sm:items-center sm:gap-1.5"
                >
                  Rate
                </Link>
                <Link
                  to={`/deals/${dealId}/chat`}
                  className="hidden rounded-full border border-app1-secondary/40 px-3 py-1.5 font-poppins text-xs font-bold text-app1-secondary transition-colors hover:bg-app1-secondary/10 sm:inline-flex sm:items-center sm:gap-1.5"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Chat
                </Link>
                <button type="button" className="rounded p-2 text-app1-text-muted transition-colors hover:text-app1-secondary" aria-label="Notifications">
                  <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </button>
                <button type="button" className="rounded p-2 text-app1-text-muted transition-colors hover:text-app1-secondary" aria-label="Settings">
                  <Settings className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 space-y-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">Deal Pipeline</p>
                  <h2 className="mt-1 font-cinzel text-2xl font-black text-app1-primary">{stepLabel(deal.currentStep)}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-app1-text-muted">
                    {nextStep
                      ? `Next checkpoint: ${stepLabel(nextStep)}. ${
                          adminHandlesNextStep ? 'Only an admin can advance this stage.' : BUYER_ADVANCE_STEPS.has(nextStep)
                            ? 'Only the primary buyer can advance this stage.'
                            : 'Only the listing owner (wholesaler/realtor) can advance early stages.'
                        }`                      : 'This deal has reached the end of the pipeline.'}
                  </p>
                </div>
                <StatusPill status={!canViewSellerFinancials ? stepLabel(deal.currentStep) : deal.currentStep} />
              </div>

              {/* ponytail: re-enable title rep assignment banner when AI title rep ships */}
              {false && !hasTitleRep ? (
                <div className="rounded-app1-card border border-app1-warning/40 bg-app1-warning/10 p-5 shadow-app1-card">
                  <p className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-warning">
                    Title representative required
                  </p>
                  <p className="mt-2 font-poppins text-sm text-app1-text-main">
                    Steps 4–8 cannot advance until a title rep is assigned
                    {isAdmin ? '.' : '. Ask an admin to assign one from All Deals or below.'}
                  </p>
                  {isAdmin ? (
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                        <span className="font-poppins text-[10px] font-black uppercase tracking-wider text-app1-text-muted">
                          Assign title rep
                        </span>
                        <select
                          value={selectedTitleRepId}
                          onChange={(e) => setSelectedTitleRepId(e.target.value)}
                          className="rounded-xl border border-app1-border-light bg-app1-bg-card px-3 py-2.5 font-poppins text-sm text-app1-text-main outline-none focus:border-app1-secondary"
                        >
                          <option value="">Select a title rep…</option>
                          {titleReps.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.fullName} ({r.email})
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={!selectedTitleRepId || reassignTitleRep.isPending || !dealId}
                        onClick={() => {
                          if (!dealId || !selectedTitleRepId) return
                          reassignTitleRep.mutate(
                            { dealId, titleRepId: selectedTitleRepId },
                            { onSuccess: () => setSelectedTitleRepId('') },
                          )
                        }}
                        className="rounded-xl bg-app1-secondary px-5 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark disabled:opacity-50"
                      >
                        {reassignTitleRep.isPending ? 'Assigning…' : 'Assign'}
                      </button>
                      {titleReps.length === 0 ? (
                        <p className="w-full font-poppins text-xs text-app1-danger">
                          No title_rep users found. Create a title_rep account first.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-3 font-poppins text-xs text-app1-text-muted">
                      Admins can assign from Admin → All Deals, or open this deal while logged in as admin.
                    </p>
                  )}
                </div>
              ) : null}

              <button
                type="button"
                disabled={!nextStep || !canAdvanceThisUser || advanceStep.isPending}
                onClick={onAdvance}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-app1-secondary px-6 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-primary-dark shadow-app1-premium transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {advanceStep.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Advancing…
                  </>
                ) : nextStep ? (
                  `Advance to ${stepLabel(nextStep)}`
                ) : (
                  'Pipeline complete'
                )}
              </button>

              {adminHandlesNextStep && !isAdmin && (
                <p role="status" className="rounded-xl border border-app1-border-light bg-app1-bg-card p-4 text-sm">Awaiting admin: you selected Admin as your title representative. Only an admin can advance the remaining title and closing steps.</p>
              )}
              {showTitleChoice && !deal.titleHandling && (
                <section aria-labelledby="title-choice-heading" className="rounded-xl border border-app1-border-light bg-app1-bg-card p-6">
                  <h2 id="title-choice-heading" className="font-semibold text-app1-text-main">Do you have your own title rep, or would you like us to handle this for you?</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(['own_rep', 'tract'] as const).map((choice) => (
                      <button key={choice} type="button" disabled={titleHandling.isPending}
                        className="rounded-lg border border-app1-border-light px-4 py-3 text-sm disabled:opacity-50"
                        onClick={() => titleHandling.mutate(choice, { onSuccess: () => {
                          setShowTitleChoice(false)
                          advanceStep.mutate('title_search_complete')
                        } })}>
                        {choice === 'own_rep' ? 'I have my own title rep' : 'Admin as my title rep'}
                      </button>
                    ))}
                    <button type="button" onClick={() => setShowTitleChoice(false)} className="px-4 py-3 text-sm">Cancel</button>
                  </div>
                </section>
              )}
              {deal.titleHandling && (
                <section className="rounded-xl border border-app1-border-light bg-app1-bg-card p-6">
                  <p className="text-sm">Title handling: {deal.titleHandling === 'own_rep' ? 'Buyer-owned own title representative' : 'Admin as title representative'}</p>
                  <p className="mt-2 text-sm text-app1-text-muted">The admin dashboard receives this deal when title search begins. Download property pictures, address, prices and the signed buyer/lister agreement for your title representative.</p>
                  <button type="button" disabled={titlePackage.isPending} onClick={() => titlePackage.mutate()}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-app1-secondary px-4 py-3 text-sm font-semibold disabled:opacity-50">
                    <Download className="h-4 w-4" />{titlePackage.isPending ? 'Preparing package…' : 'Download title package (.zip)'}
                  </button>
                </section>
              )}
              <p className="font-poppins text-xs italic text-app1-warning">
                Steps 1–3 advance by wholesaler/realtor. Steps 4–8 advance by the primary buyer.
              </p>

              {deal.marketingProofDeadline && !deal.marketingProofUploaded ? (
                <div
                  className={cn(
                    'flex flex-col items-stretch justify-between gap-6 rounded-app1-card border p-6 shadow-app1-card md:flex-row md:items-center md:p-8',
                    killUrgent
                      ? 'border-app1-danger bg-app1-danger/10'
                      : killWarning
                        ? 'border-app1-warning/60 bg-app1-warning/5'
                        : 'border-amber-300/60 bg-amber-50/50',
                  )}
                >
                  <div>
                    <span
                      className={cn(
                        'mb-2 block font-poppins text-xs font-black uppercase tracking-widest',
                        killUrgent ? 'text-app1-danger' : killWarning ? 'text-app1-warning' : 'text-amber-700',
                      )}
                    >
                      Marketing Proof Deadline
                    </span>
                    <div
                      className={cn(
                        'font-cinzel text-5xl font-black tabular-nums tracking-tight leading-none',
                        killUrgent ? 'text-app1-danger' : killWarning ? 'text-app1-warning' : 'text-amber-600',
                      )}
                    >
                      {remainSec > 0 ? (
                        deadlineLabel
                      ) : (
                        <span className="font-cinzel text-2xl font-black text-app1-danger">Deadline passed</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={uploadProof.isPending}
                    onClick={onUploadProofClick}
                    className="shrink-0 rounded-xl bg-app1-danger px-8 py-4 font-poppins text-sm font-black uppercase tracking-wide text-white transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    {uploadProof.isPending ? (
                      <>
                        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                        Uploading…
                      </>
                    ) : (
                      'Upload Proof Now'
                    )}
                  </button>
                  <input
                    ref={proofFileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="sr-only"
                    aria-label="Upload marketing proof PDF"
                    onChange={(e) => onProofFileSelected(e.target.files)}
                  />
                </div>
              ) : null}

              {canViewSellerFinancials && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">                <StatCard
                  label="EMD Status"
                  value={formatCurrency(deal.emdAmount ?? 0)}
                  note={deal.emdStatus ?? 'pending'}
                  icon={Check}
                  tone="primary"
                />

                {/* ponytail: re-enable Title Company card when title flow returns */}              </div>}

              {canViewSellerFinancials && acquisition ? (
                <section className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
                  <p className="font-poppins text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
                    Acquisition
                  </p>
                  <h3 className="mt-2 font-cinzel text-xl font-black text-app1-primary">
                    Seller Tract origin
                  </h3>
                  <p className="mt-2 max-w-2xl font-poppins text-sm leading-6 text-app1-text-muted">
                    Read-only details from the signed App1 deal linked when this listing was created.
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
                      <p className="font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                        Address
                      </p>
                      <p className="mt-2 font-poppins text-sm font-bold text-app1-text-main">
                        {acquisition.address || '—'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
                      <p className="font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                        Purchase price
                      </p>
                      <p className="mt-2 font-cinzel text-lg font-black text-app1-primary">
                        {acquisition.purchasePrice > 0
                          ? formatCurrency(acquisition.purchasePrice)
                          : '—'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
                      <p className="font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                        Closed date
                      </p>
                      <p className="mt-2 font-poppins text-sm font-bold text-app1-text-main">
                        {acquisition.closedAt ? formatDate(acquisition.closedAt) : '—'}
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <h3 className="font-cinzel text-xl font-black text-app1-primary">Pipeline Timeline</h3>
                  {pipelineSteps.find((s) => s.state === 'active')?.timeInStep ? (
                    <p className="font-poppins text-xs font-bold uppercase tracking-[0.14em] text-app1-secondary">
                      Time in current step:{' '}
                      {pipelineSteps.find((s) => s.state === 'active')?.timeInStep}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-3">
                  {pipelineSteps.map((step) => (
                    <TrackerStep
                      key={step.id}
                      title={step.label}
                      description={
                        step.state === 'complete'
                          ? 'Completed'
                          : step.state === 'active'
                            ? step.timeInStep
                              ? `In progress · ${step.timeInStep}`
                              : 'Currently in progress'
                            : 'Not started yet'
                      }
                      done={step.state === 'complete'}
                      current={step.state === 'active'}
                    />
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                      <h3 className="mb-4 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                        Deal Documents
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft p-3">
                          <span className="font-poppins text-sm text-app1-text-main">Assignment_Contract.pdf</span>
                          <button
                            type="button"
                            onClick={() => void downloadContract()}
                            className="text-app1-secondary hover:opacity-80"
                            aria-label="Download contract"
                          >
                            <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </button>
                        </div>
                        {canViewSellerFinancials && (<div className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft p-3">
                          <span className="font-poppins text-sm text-app1-text-main">EMD_Wire_Instructions.pdf</span>
                          <button
                            type="button"
                            onClick={() => void downloadEmd()}
                            className="text-app1-secondary hover:opacity-80"
                            aria-label="Download EMD instructions"
                          >
                            <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </button>
                        </div>)}
                      </div>
                    </div>
                    {canViewSellerFinancials && (<div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                      <h3 className="mb-4 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                        Internal Notes
                      </h3>
                      <p className="font-poppins text-sm italic text-app1-text-muted">
                        {deal?.notes?.trim() ? deal.notes : 'No internal notes for this deal.'}
                      </p>
                    </div>)}
                  </div>
                </div>

                <div className="space-y-6 lg:col-span-4">
                  <SubscriptionPanel />

                  <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                    <h3 className="mb-6 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                      Closing Info
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                          Title Representative
                        </p>
                        <p className="mt-1 font-poppins text-sm font-black text-app1-text-main">
                          {hasTitleRep
                            ? (deal.titleRepName ?? deal.titleRep?.fullName ?? 'Assigned')
                            : 'Not yet assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                          Title Company
                        </p>
                        <p className="mt-1 font-poppins text-sm font-black text-app1-text-main">
                          {deal.titleCompanyName?.trim() || 'Not yet assigned'}
                        </p>
                      </div>
                      {isAdmin && hasTitleRep ? (
                        <div className="border-t border-app1-border-light pt-4">
                          <p className="mb-2 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                            Reassign title rep
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={selectedTitleRepId}
                              onChange={(e) => setSelectedTitleRepId(e.target.value)}
                              className="min-w-0 flex-1 rounded-xl border border-app1-border-light bg-app1-bg-soft px-3 py-2 font-poppins text-sm text-app1-text-main outline-none"
                            >
                              <option value="">Select…</option>
                              {titleReps.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.fullName}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={!selectedTitleRepId || reassignTitleRep.isPending || !dealId}
                              onClick={() => {
                                if (!dealId || !selectedTitleRepId) return
                                reassignTitleRep.mutate(
                                  { dealId, titleRepId: selectedTitleRepId },
                                  { onSuccess: () => setSelectedTitleRepId('') },
                                )
                              }}
                              className="rounded-xl bg-app1-secondary px-4 py-2 font-poppins text-[10px] font-black uppercase tracking-wider text-app1-primary-dark disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                    <h3 className="mb-6 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                      Backup Queue
                    </h3>

                    {!deal?.backup2BuyerId && !deal?.backup3BuyerId ? (
                      <p className="font-poppins text-[13px] text-app1-text-muted">No backup buyers assigned.</p>
                    ) : (
                      <div className="space-y-3">
                        {deal?.backup2BuyerId ? (
                          <div className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-app1-secondary/10 font-poppins text-[12px] font-black text-app1-secondary">
                                B2
                              </span>
                              <div>
                                <p className="font-poppins text-[13px] font-black text-app1-text-main">
                                  {typeof deal.backup2BuyerId === 'object'
                                    ? (deal.backup2BuyerId.fullName ?? 'Backup Buyer #2')
                                    : 'Backup Buyer #2'}
                                </p>
                                <p className="font-poppins text-[11px] text-app1-text-muted">Backup #2</p>
                              </div>
                            </div>
                            <span className="font-poppins text-[11px] font-black uppercase tracking-wide text-app1-text-muted">
                              Waiting
                            </span>
                          </div>
                        ) : null}

                        {deal?.backup3BuyerId ? (
                          <div className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-app1-secondary/10 font-poppins text-[12px] font-black text-app1-secondary">
                                B3
                              </span>
                              <div>
                                <p className="font-poppins text-[13px] font-black text-app1-text-main">
                                  {typeof deal.backup3BuyerId === 'object'
                                    ? (deal.backup3BuyerId.fullName ?? 'Backup Buyer #3')
                                    : 'Backup Buyer #3'}
                                </p>
                                <p className="font-poppins text-[11px] text-app1-text-muted">Backup #3</p>
                              </div>
                            </div>
                            <span className="font-poppins text-[11px] font-black uppercase tracking-wide text-app1-text-muted">
                              Waiting
                            </span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <VaultSection dealId={dealId ?? ''} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </DashboardLayout>
  )
}
