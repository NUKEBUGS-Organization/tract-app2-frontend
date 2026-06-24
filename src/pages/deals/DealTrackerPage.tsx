import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Check,
  Download,
  Loader2,
  Lock,
  MessageCircle,
  Settings,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
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

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-theme-bg font-inter text-theme-text">
        {deal?.disputeFrozen ? (
          <div className="flex w-full items-center justify-center gap-3 bg-[#ffb4ab] py-4 font-inter text-sm font-bold uppercase tracking-widest text-[#690005]">
            <span aria-hidden>!</span>
            Deal frozen — dispute in progress
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-tract-gold" aria-hidden />
          </div>
        ) : isError || !deal ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center font-inter text-theme-muted">
            <p>Unable to load this deal.</p>
            <Link to="/buyer/dashboard" className="text-tract-gold underline">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-theme-border bg-theme-topbar px-4 md:px-12">
          <div className="min-w-0 flex flex-col">
            <h1 className="truncate font-playfair text-xl font-bold text-theme-text md:text-[22px]">
              {listingAddressLine(deal.listingId)}
            </h1>
            <p className="font-inter text-[13px] font-semibold tracking-wide text-theme-muted">{dealRef}</p>
          </div>
          <div className="hidden items-center gap-6 lg:flex">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-theme-border bg-theme-surface-2 font-inter text-[10px] font-bold text-theme-muted">
                  {deal.primaryBuyer.fullName.slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-theme-text">{deal.primaryBuyer.fullName}</span>
                  <span className="text-[11px] font-medium leading-tight text-theme-muted">Buyer</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-theme-border bg-theme-surface-2 font-inter text-[10px] font-bold text-theme-muted">
                  {(deal.wholesaler?.fullName ?? 'W').slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-theme-text">
                    {deal.wholesaler?.fullName ?? 'Wholesaler'}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-theme-muted">Wholesaler</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-theme-border bg-theme-surface-2 font-inter text-[10px] font-bold text-theme-muted">
                  {(deal.titleRep?.fullName ?? 'T').slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-theme-text">
                    {deal.titleRep?.fullName ?? 'Title (unassigned)'}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-theme-muted">Title rep</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to={`/deals/${dealId}/rating`}
              className="hidden rounded-full border border-tract-gold/40 px-3 py-1.5 font-inter text-xs font-semibold text-tract-gold transition-colors hover:bg-tract-gold/10 sm:inline-flex sm:items-center sm:gap-1.5"
            >
              Rate
            </Link>
            <Link
              to={`/deals/${dealId}/chat`}
              className="hidden rounded-full border border-tract-gold/40 px-3 py-1.5 font-inter text-xs font-semibold text-tract-gold transition-colors hover:bg-tract-gold/10 sm:inline-flex sm:items-center sm:gap-1.5"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
              Chat
            </Link>
            <button type="button" className="rounded p-2 text-theme-muted transition-colors hover:text-tract-gold" aria-label="Notifications">
              <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            <button type="button" className="rounded p-2 text-theme-muted transition-colors hover:text-tract-gold" aria-label="Settings">
              <Settings className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </header>

        <section className="shrink-0 border-b border-theme-border bg-theme-topbar px-4 py-6 md:px-12">
          <div className="relative mb-6 min-w-0 overflow-x-auto pb-1">
            <div className="relative min-w-[720px]">
            <div className="absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-gray-200" aria-hidden />
            <div
              className="absolute left-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-tract-gold transition-all"
              style={{ width: `${linePct}%` }}
              aria-hidden
            />
            <div className="relative z-10 flex w-full justify-between gap-1">
              {pipelineSteps.map((step) => (
                <div key={step.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  {step.state === 'complete' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tract-gold text-[#3c2f00]">
                      <Check className="h-5 w-5" strokeWidth={3} aria-hidden />
                    </div>
                  ) : null}
                  {step.state === 'active' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-topbar ring-4 ring-tract-gold ring-offset-4 ring-offset-white">
                      <div className="h-2 w-2 rounded-full bg-tract-gold" />
                    </div>
                  ) : null}
                  {step.state === 'locked' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-surface-2 text-tract-rose">
                      <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </div>
                  ) : null}
                  <span
                    className={cn(
                      'text-center font-inter text-[10px] font-bold uppercase leading-tight tracking-wider',
                      step.state === 'active' ? 'text-tract-gold' : 'text-theme-muted',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            </div>
          </div>
          <p className="text-center font-inter text-xs italic text-tract-rose">
            Steps 1–3 can be advanced by buyer or wholesaler. Steps 4–8 require your title representative.
          </p>
        </section>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-4 py-8 lg:grid-cols-12 lg:px-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-lg border border-theme-border bg-theme-card p-6 md:p-8">
              <h2 className="mb-3 font-playfair text-xl font-bold text-theme-text md:text-[22px]">
                Current step: {STEP_LABELS[deal.currentStep]}
              </h2>
              <p className="mb-8 max-w-2xl font-inter text-base text-theme-muted">
                {nextStep
                  ? `Next pipeline checkpoint: ${STEP_LABELS[nextStep]}. ${
                      TITLE_REP_ADVANCE_STEPS.has(nextStep)
                        ? 'Your title representative advances this stage.'
                        : 'Buyer or wholesaler may advance when requirements are met.'
                    }`
                  : 'This deal has reached the end of the pipeline.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={!nextStep || !canAdvanceThisUser || advanceStep.isPending}
                  onClick={onAdvance}
                  className="rounded-lg bg-tract-gold px-6 py-3 font-inter text-sm font-semibold text-[#554300] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  {advanceStep.isPending ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                      Advancing…
                    </>
                  ) : nextStep ? (
                    `Advance to ${STEP_LABELS[nextStep]}`
                  ) : (
                    'Pipeline complete'
                  )}
                </button>
              </div>
            </div>

            {deal.marketingProofDeadline && !deal.marketingProofUploaded ? (
              <div
                className={cn(
                  'flex flex-col items-stretch justify-between gap-6 rounded-lg border p-6 md:flex-row md:items-center md:p-8',
                  killUrgent
                    ? 'border-tract-red bg-tract-red/10'
                    : killWarning
                      ? 'border-tract-orange/60 bg-tract-orange/5'
                      : 'border-amber-300/60 bg-amber-50/50',
                )}
              >
                <div>
                  <span
                    className={cn(
                      'mb-2 block font-inter text-xs font-bold uppercase tracking-widest',
                      killUrgent
                        ? 'text-tract-red'
                        : killWarning
                          ? 'text-tract-orange'
                          : 'text-amber-700',
                    )}
                  >
                    Marketing proof deadline
                  </span>
                  <div
                    className={cn(
                      'font-playfair text-5xl leading-none',
                      killUrgent
                        ? 'text-tract-red'
                        : killWarning
                          ? 'text-tract-orange'
                          : 'text-amber-600',
                    )}
                  >
                    {deadlineLabel}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={uploadProof.isPending}
                  onClick={onUploadProofClick}
                  className="shrink-0 rounded-lg bg-tract-red px-8 py-4 font-inter text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                >
                  {uploadProof.isPending ? (
                    <>
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
                      Uploading…
                    </>
                  ) : (
                    'Upload proof now'
                  )}
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-theme-border bg-theme-card p-6">
                <h3 className="mb-4 font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">
                  Deal Documents
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded border border-theme-border bg-theme-surface-2 p-3">
                    <span className="font-inter text-sm text-theme-text">Assignment_Contract.pdf</span>
                    <button
                      type="button"
                      onClick={() => void downloadContract()}
                      className="text-tract-gold hover:opacity-80"
                      aria-label="Download contract"
                    >
                      <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded border border-theme-border bg-theme-surface-2 p-3">
                    <span className="font-inter text-sm text-theme-text">EMD_Wire_Instructions.pdf</span>
                    <button
                      type="button"
                      onClick={() => void downloadEmd()}
                      className="text-tract-gold hover:opacity-80"
                      aria-label="Download EMD instructions"
                    >
                      <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-theme-border bg-theme-card p-6">
                <h3 className="mb-4 font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">
                  Internal Notes
                </h3>
                <p className="font-inter text-sm italic text-theme-muted">
                  {deal?.notes?.trim() ? deal.notes : 'No internal notes for this deal.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-lg border border-theme-border bg-theme-card p-6">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">EMD status</h3>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div className="font-playfair text-5xl leading-none text-tract-gold">
                  {formatCurrency(deal.emdAmount ?? 0)}
                </div>
                <div className="inline-flex items-center gap-1 rounded bg-tract-green-light px-2 py-1 font-inter text-[10px] font-bold uppercase tracking-wider text-tract-green">
                  {deal.emdStatus ?? 'pending'}
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </div>
              </div>
              <p className="mt-4 border-t border-theme-border pt-4 font-inter text-sm text-theme-muted">
                Title company:{' '}
                <span className="font-semibold text-theme-text">
                  {deal.titleCompanyName?.trim() ? deal.titleCompanyName : 'Not assigned yet'}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-theme-border bg-theme-card p-6">
              <h3 className="mb-4 font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">Platform Fees</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-inter text-[13px] font-bold text-theme-text">Buyer Utilization Fee</p>
                    <p className="mt-0.5 font-inter text-[11px] text-theme-muted">1.5% of contract price</p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter text-[14px] font-bold text-tract-gold">{formatCurrency(buyerFee)}</p>
                    <p className="font-inter text-[10px] text-theme-muted">
                      {deal?.currentStep === 'funded_closed' ? 'Collected ✓' : 'Due at closing'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-theme-border" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-inter text-[13px] font-bold text-theme-text">Wholesaler SaaS Fee</p>
                    <p className="mt-0.5 font-inter text-[11px] text-theme-muted">Flat fee per transaction</p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter text-[14px] font-bold text-tract-gold">${wholesalerFee}</p>
                    <p className="font-inter text-[10px] text-theme-muted">
                      {deal?.currentStep === 'funded_closed' ? 'Collected ✓' : 'Due at closing'}
                    </p>
                  </div>
                </div>
              </div>

              {deal?.currentStep !== 'funded_closed' ? (
                <p className="mt-4 border-t border-theme-border pt-3 font-inter text-[11px] italic text-theme-muted">
                  Fees are success-based. Not charged if the transaction falls through during feasibility or title period.
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-theme-border bg-theme-card p-6">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">
                Backup Queue
              </h3>

              {!deal?.backup2BuyerId && !deal?.backup3BuyerId ? (
                <p className="font-inter text-[13px] text-theme-muted">No backup buyers assigned.</p>
              ) : (
                <div className="space-y-3">
                  {deal?.backup2BuyerId ? (
                    <div className="flex items-center justify-between rounded-lg border border-theme-border bg-theme-surface-2 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tract-gold/10 font-inter text-[12px] font-bold text-tract-gold">
                          B2
                        </span>
                        <div>
                          <p className="font-inter text-[13px] font-bold text-theme-text">
                            {typeof deal.backup2BuyerId === 'object'
                              ? deal.backup2BuyerId.fullName ?? 'Backup Buyer #2'
                              : 'Backup Buyer #2'}
                          </p>
                          <p className="font-inter text-[11px] text-theme-muted">Backup #2</p>
                        </div>
                      </div>
                      <span className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                        Waiting
                      </span>
                    </div>
                  ) : null}

                  {deal?.backup3BuyerId ? (
                    <div className="flex items-center justify-between rounded-lg border border-theme-border bg-theme-surface-2 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tract-gold/10 font-inter text-[12px] font-bold text-tract-gold">
                          B3
                        </span>
                        <div>
                          <p className="font-inter text-[13px] font-bold text-theme-text">
                            {typeof deal.backup3BuyerId === 'object'
                              ? deal.backup3BuyerId.fullName ?? 'Backup Buyer #3'
                              : 'Backup Buyer #3'}
                          </p>
                          <p className="font-inter text-[11px] text-theme-muted">Backup #3</p>
                        </div>
                      </div>
                      <span className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">
                        Waiting
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-[10px] border border-theme-border bg-theme-surface-2 p-4">
              <p className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted">Secure Vault</p>
              <p className="mt-1 font-inter text-[12px] text-theme-muted">Document vault coming in next release.</p>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
    </DashboardLayout>
  )
}
