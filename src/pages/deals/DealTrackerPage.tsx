import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Check,
  Clock3,
  Download,
  Loader2,
  MessageCircle,
  Settings,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import VaultSection from '@/components/vault/VaultSection'
import TrackerStep from '@/components/app1/TrackerStep'
import StatCard from '@/components/app1/StatCard'
import StatusPill from '@/components/app1/StatusPill'
import { useAdvanceStep, useDeal, useUploadMarketingProof } from '@/hooks/useDeal'
import { useContractPdf, useEmdPdf } from '@/hooks/usePdf'
import { useDealSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import type { DealStep } from '@/types'
import { DEAL_STEP_ORDER, TITLE_REP_ADVANCE_STEPS } from '@/types'
import { cn, formatCurrency } from '@/lib/utils'

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
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [dealId, navigate])

  const { data: deal, isLoading, isError } = useDeal(dealId)
  const advanceStep = useAdvanceStep(dealId)
  const uploadProof = useUploadMarketingProof(dealId)
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

  const listingId = useMemo(() => {
    const lid = deal?.listingId
    if (!lid) return undefined
    if (typeof lid === 'object') {
      const o = lid as { _id?: string; id?: string }
      return String(o._id ?? o.id ?? '')
    }
    return String(lid)
  }, [deal?.listingId])

  const { data: primaryBid } = useQuery({
    queryKey: ['deal-primary-bid', deal?.id, listingId, user?.role],
    queryFn: async () => {
      if (!listingId) return null

      if (user?.role === 'buyer' || user?.role === 'realtor') {
        const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>('/bids/mine')
        const bids = Array.isArray(data.data) ? data.data : []
        return (
          bids.find((b) => {
            const bidListing = b.listingId as string | { _id?: string; id?: string } | undefined
            const bidListingId =
              bidListing && typeof bidListing === 'object'
                ? String(bidListing._id ?? bidListing.id ?? '')
                : String(bidListing ?? '')
            return bidListingId === listingId && b.status === 'primary'
          }) ?? null
        )
      }

      if (user?.role === 'wholesaler' || user?.role === 'admin') {
        const { data } = await api.get<ApiResponse<Record<string, unknown>[]>>(`/bids/listing/${listingId}`)
        const bids = Array.isArray(data.data) ? data.data : []
        return bids.find((b) => b.status === 'primary') ?? null
      }

      return null
    },
    enabled: Boolean(deal && listingId && user?.role),
  })

  const contractPrice = Number(primaryBid?.assignmentPrice ?? 0)
  const buyerFee = Math.round(contractPrice * 0.015)
  const wholesalerFee = 500

  const pipelineSteps = useMemo(() => {
    if (!deal) return []
    const ci = DEAL_STEP_ORDER.indexOf(deal.currentStep)
    const safe = ci < 0 ? 0 : ci
    return DEAL_STEP_ORDER.map((stepKey, i) => ({
      id: stepKey,
      label: STEP_LABELS[stepKey],
      state: i < safe ? ('complete' as const) : i === safe ? ('active' as const) : ('locked' as const),
    }))
  }, [deal])

  const currentIdx = deal ? DEAL_STEP_ORDER.indexOf(deal.currentStep) : -1
  const safeIdx = currentIdx < 0 ? 0 : currentIdx
  const linePct = DEAL_STEP_ORDER.length > 1 ? (safeIdx / (DEAL_STEP_ORDER.length - 1)) * 100 : 0

  const nextStep: DealStep | null =
    deal && safeIdx >= 0 && safeIdx < DEAL_STEP_ORDER.length - 1 ? DEAL_STEP_ORDER[safeIdx + 1] : null

  const canAdvanceThisUser =
    Boolean(user && nextStep) &&
    (!TITLE_REP_ADVANCE_STEPS.has(nextStep!) ||
      user?.role === 'title_rep' ||
      user?.role === 'admin')

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
    advanceStep.mutate(nextStep)
  }

  const onUploadProofClick = () => {
    const url = window.prompt('Enter marketing proof URL (hosted file):')
    if (!url?.trim()) return
    uploadProof.mutate(url.trim())
  }

  if (!dealId) return null

  void linePct // retained per pipeline logic; horizontal stepper removed

  return (
    <DashboardLayout sidebar={<Sidebar />}>
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
            <Link to="/buyer/dashboard" className="text-app1-secondary underline">
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
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-app1-border-light bg-app1-bg-soft font-poppins text-[10px] font-black text-app1-text-muted">
                      {(deal.titleRepName ?? deal.titleRep?.fullName ?? 'T').slice(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold leading-tight text-app1-text-main">
                        {deal.titleRepName ?? deal.titleRep?.fullName ?? 'Title (unassigned)'}
                      </span>
                      <span className="text-[11px] font-medium leading-tight text-app1-text-muted">Title rep</span>
                    </div>
                  </div>
                </div>
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
                  <h2 className="mt-1 font-cinzel text-2xl font-black text-app1-primary">{STEP_LABELS[deal.currentStep]}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-app1-text-muted">
                    {nextStep
                      ? `Next checkpoint: ${STEP_LABELS[nextStep]}. ${
                          TITLE_REP_ADVANCE_STEPS.has(nextStep)
                            ? 'Your title representative advances this stage.'
                            : 'Buyer or wholesaler may advance when requirements are met.'
                        }`
                      : 'This deal has reached the end of the pipeline.'}
                  </p>
                </div>
                <StatusPill status={deal.currentStep} />
              </div>

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
                  `Advance to ${STEP_LABELS[nextStep]}`
                ) : (
                  'Pipeline complete'
                )}
              </button>

              <p className="font-poppins text-xs italic text-app1-warning">
                Steps 1–3 can be advanced by buyer or wholesaler. Steps 4–8 require your title representative.
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
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="EMD Status"
                  value={formatCurrency(deal.emdAmount ?? 0)}
                  note={deal.emdStatus ?? 'pending'}
                  icon={Check}
                  tone="primary"
                />
                <StatCard
                  label="Buyer Fee"
                  value={formatCurrency(buyerFee)}
                  note={deal.currentStep === 'funded_closed' ? 'Collected' : 'Due at closing'}
                  icon={Clock3}
                  tone="neutral"
                />
                <StatCard
                  label="Wholesaler Fee"
                  value={`$${wholesalerFee}`}
                  note={deal.currentStep === 'funded_closed' ? 'Collected' : 'Due at closing'}
                  icon={Clock3}
                  tone="neutral"
                />
                <StatCard
                  label="Title Company"
                  value={deal.titleCompanyName?.trim() ? deal.titleCompanyName : 'Unassigned'}
                  note={deal.titleCompanyName?.trim() ? 'Routing active' : 'Selection needed'}
                  icon={Check}
                  tone={deal.titleCompanyName?.trim() ? 'primary' : 'warning'}
                  path={
                    !deal?.titleCompanyName?.trim() && (user?.role === 'buyer' || user?.role === 'realtor')
                      ? `/deals/${dealId}/title-company`
                      : undefined
                  }
                />
              </div>

              <section className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
                <h3 className="mb-6 font-cinzel text-xl font-black text-app1-primary">Pipeline Timeline</h3>
                <div className="space-y-3">
                  {pipelineSteps.map((step) => (
                    <TrackerStep
                      key={step.id}
                      title={step.label}
                      description={
                        step.state === 'complete'
                          ? 'Completed'
                          : step.state === 'active'
                            ? 'Currently in progress'
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
                        <div className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft p-3">
                          <span className="font-poppins text-sm text-app1-text-main">EMD_Wire_Instructions.pdf</span>
                          <button
                            type="button"
                            onClick={() => void downloadEmd()}
                            className="text-app1-secondary hover:opacity-80"
                            aria-label="Download EMD instructions"
                          >
                            <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                      <h3 className="mb-4 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                        Internal Notes
                      </h3>
                      <p className="font-poppins text-sm italic text-app1-text-muted">
                        {deal?.notes?.trim() ? deal.notes : 'No internal notes for this deal.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 lg:col-span-4">
                  <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                    <h3 className="mb-6 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
                      Platform Fees
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-poppins text-[13px] font-black text-app1-text-main">Buyer Utilization Fee</p>
                          <p className="mt-0.5 font-poppins text-[11px] text-app1-text-muted">1.5% of contract price</p>
                        </div>
                        <div className="text-right">
                          <p className="font-poppins text-[14px] font-black text-app1-secondary">{formatCurrency(buyerFee)}</p>
                          <p className="font-poppins text-[10px] text-app1-text-muted">
                            {deal?.currentStep === 'funded_closed' ? 'Collected ✓' : 'Due at closing'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-app1-border-light" />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-poppins text-[13px] font-black text-app1-text-main">Wholesaler SaaS Fee</p>
                          <p className="mt-0.5 font-poppins text-[11px] text-app1-text-muted">Flat fee per transaction</p>
                        </div>
                        <div className="text-right">
                          <p className="font-poppins text-[14px] font-black text-app1-secondary">${wholesalerFee}</p>
                          <p className="font-poppins text-[10px] text-app1-text-muted">
                            {deal?.currentStep === 'funded_closed' ? 'Collected ✓' : 'Due at closing'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {deal?.currentStep !== 'funded_closed' ? (
                      <p className="mt-4 border-t border-app1-border-light pt-3 font-poppins text-[11px] italic text-app1-text-muted">
                        Fees are success-based. Not charged if the transaction falls through during feasibility or title period.
                      </p>
                    ) : null}
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
