import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Bell,
  Check,
  Download,
  Loader2,
  Lock,
  MessageCircle,
  Settings,
} from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useAdvanceStep, useDeal, useUploadMarketingProof } from '@/hooks/useDeal'
import { useDealSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/store/authStore'
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
    const st = String(l.stateCode ?? '')
    if (addr && st) return `${addr}, ${st}`
    if (addr) return addr
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

  const killUrgent = remainSec > 0 && remainSec < 12 * 3600

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
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-tract-alabaster font-inter text-tract-obsidian">
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
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center font-inter text-gray-500">
            <p>Unable to load this deal.</p>
            <Link to="/buyer/dashboard" className="text-tract-gold underline">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 md:px-12">
          <div className="min-w-0 flex flex-col">
            <h1 className="truncate font-playfair text-xl font-bold text-tract-obsidian md:text-[22px]">
              {listingAddressLine(deal.listingId)}
            </h1>
            <p className="font-inter text-[13px] font-semibold tracking-wide text-gray-500">{dealRef}</p>
          </div>
          <div className="hidden items-center gap-6 lg:flex">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 font-inter text-[10px] font-bold text-gray-600">
                  {deal.primaryBuyer.fullName.slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-tract-obsidian">{deal.primaryBuyer.fullName}</span>
                  <span className="text-[11px] font-medium leading-tight text-gray-500">Buyer</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 font-inter text-[10px] font-bold text-gray-600">
                  {(deal.wholesaler?.fullName ?? 'W').slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-tract-obsidian">
                    {deal.wholesaler?.fullName ?? 'Wholesaler'}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-gray-500">Wholesaler</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 font-inter text-[10px] font-bold text-gray-600">
                  {(deal.titleRep?.fullName ?? 'T').slice(0, 1)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold leading-tight text-tract-obsidian">
                    {deal.titleRep?.fullName ?? 'Title (unassigned)'}
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-gray-500">Title rep</span>
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
            <button type="button" className="rounded p-2 text-gray-400 transition-colors hover:text-tract-gold" aria-label="Notifications">
              <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            <button type="button" className="rounded p-2 text-gray-400 transition-colors hover:text-tract-gold" aria-label="Settings">
              <Settings className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </header>

        <section className="shrink-0 border-b border-gray-100 bg-white px-4 py-6 md:px-12">
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-4 ring-tract-gold ring-offset-4 ring-offset-white">
                      <div className="h-2 w-2 rounded-full bg-tract-gold" />
                    </div>
                  ) : null}
                  {step.state === 'locked' ? (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-tract-rose">
                      <Lock className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </div>
                  ) : null}
                  <span
                    className={cn(
                      'text-center font-inter text-[10px] font-bold uppercase leading-tight tracking-wider',
                      step.state === 'active' ? 'text-tract-gold' : 'text-gray-500',
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
            Steps 4–8 can only be advanced by your title representative.
          </p>
        </section>

        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-4 py-8 lg:grid-cols-12 lg:px-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-lg border border-gray-100 bg-white p-6 md:p-8">
              <h2 className="mb-3 font-playfair text-xl font-bold text-tract-obsidian md:text-[22px]">
                Current step: {STEP_LABELS[deal.currentStep]}
              </h2>
              <p className="mb-8 max-w-2xl font-inter text-base text-gray-500">
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
                  killUrgent ? 'border-tract-red bg-tract-red/10' : 'border-tract-red/40 bg-tract-red/10',
                )}
              >
                <div>
                  <span
                    className={cn(
                      'mb-2 block font-inter text-xs font-bold uppercase tracking-widest',
                      killUrgent ? 'text-tract-red' : 'text-tract-red',
                    )}
                  >
                    Marketing proof deadline
                  </span>
                  <div className={cn('font-playfair text-5xl leading-none', killUrgent ? 'text-tract-red' : 'text-tract-red')}>
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
              <div className="rounded-lg border border-gray-100 bg-white p-6">
                <h3 className="mb-4 font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Deal documents</h3>
                <ul className="space-y-2">
                  {['Purchase_Contract.pdf', 'Lead_Paint_Disclosure.pdf'].map((name) => (
                    <li
                      key={name}
                      className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 p-3"
                    >
                      <span className="font-inter text-sm text-tract-obsidian">{name}</span>
                      <button type="button" className="text-tract-gold hover:opacity-80" aria-label={`Download ${name}`}>
                        <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-gray-100 bg-white p-6">
                <h3 className="mb-4 font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Internal notes</h3>
                <p className="font-inter text-sm italic text-gray-500">
                  &quot;Buyer requested roof inspection report from 2022. Marcus T. has shared it via the vault.&quot;
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-lg border border-gray-100 bg-white p-6">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-wider text-gray-500">EMD status</h3>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div className="font-playfair text-5xl leading-none text-tract-gold">
                  {formatCurrency(deal.emdAmount ?? 0)}
                </div>
                <div className="inline-flex items-center gap-1 rounded bg-tract-green-light px-2 py-1 font-inter text-[10px] font-bold uppercase tracking-wider text-tract-green">
                  {deal.emdStatus ?? 'pending'}
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </div>
              </div>
              <p className="mt-4 border-t border-gray-100 pt-4 font-inter text-sm text-gray-500">
                Title company:{' '}
                <span className="font-semibold text-tract-obsidian">
                  {deal.titleCompanyName?.trim() ? deal.titleCompanyName : 'Not assigned yet'}
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-white p-6">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Backup queue</h3>
              <div className="space-y-4">
                {[
                  { tag: 'B2', name: 'Backup #2', net: 492_000 },
                  { tag: 'B3', name: 'Backup #3', net: 488_500 },
                ].map((b) => (
                  <div
                    key={b.tag}
                    className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-inter text-[10px] font-bold text-gray-600">
                        {b.tag}
                      </div>
                      <div>
                        <div className="font-inter text-sm font-semibold text-tract-obsidian">{b.name}</div>
                        <div className="text-[11px] text-gray-500">{formatCurrency(b.net)} net</div>
                      </div>
                    </div>
                    <span className="rounded border border-tract-rose/30 px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wider text-tract-rose">
                      Waiting
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => toast.message('Full backup list coming soon.')}
                className="mt-6 w-full font-inter text-xs font-semibold text-gray-500 transition-colors hover:text-tract-obsidian"
              >
                View all backups (5)
              </button>
            </div>

            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-6">
              <div className="mb-3 flex items-center gap-3 text-gray-500">
                <Lock className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                <span className="font-inter text-xs font-bold uppercase tracking-wider">Secure vault access</span>
              </div>
              <p className="mb-4 text-[11px] leading-relaxed text-gray-500">
                All private communication and financial documents are encrypted in the TRACT Vault.
              </p>
              <button
                type="button"
                onClick={() => toast.message('Vault entry coming soon.')}
                className="w-full rounded-lg bg-gray-100 py-2 font-inter text-sm font-semibold text-tract-obsidian transition-colors hover:bg-gray-200"
              >
                Enter vault
              </button>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
    </DashboardLayout>
  )
}
