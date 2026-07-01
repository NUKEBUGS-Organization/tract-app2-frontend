import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { useEmdPdf } from '@/hooks/usePdf'

const HEADER_AVATAR = DEFAULT_AVATAR_IMAGE

const EMD_CENTS = 500_000 // $5,000.00 display via formatter

const WIRE = {
  bankName: 'First American Title Escrow',
  accountFull: '882900004521',
  routingFull: '0210000218832',
} as const

function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function maskTail(digits: string, visible = 4): string {
  if (digits.length <= visible) return digits
  return `••••••••${digits.slice(-visible)}`
}

function dealReference(dealId: string): string {
  const slug = dealId.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').slice(0, 24).toUpperCase()
  return `Deal #D-${slug || 'TRACT'}`
}

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${h}h ${m}m remaining`
}

type LocationState = { titleCompany?: string }

export default function EmdInstructionsPage() {
  const { dealId } = useParams<{ dealId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const titleCompany = state?.titleCompany?.trim() || 'First American Title'

  const [showAccount, setShowAccount] = useState(false)
  const [remainingSec, setRemainingSec] = useState(47 * 3600 + 23 * 60)
  const downloadEmd = useEmdPdf(dealId)

  useEffect(() => {
    if (!dealId) {
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [dealId, navigate])

  useEffect(() => {
    const t = window.setInterval(() => {
      setRemainingSec((s) => Math.max(0, s - 60))
    }, 60_000)
    return () => window.clearInterval(t)
  }, [])

  const refLine = useMemo(() => (dealId ? dealReference(dealId) : ''), [dealId])
  const amountDisplay = formatMoney(EMD_CENTS)

  const copyAll = useCallback(async () => {
    const text = [
      `Bank name: ${WIRE.bankName}`,
      `Account number: ${WIRE.accountFull}`,
      `Routing number: ${WIRE.routingFull}`,
      `Reference: ${refLine}`,
      `Amount: ${amountDisplay}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Wire instructions copied to clipboard.')
    } catch {
      toast.error('Could not copy. Select and copy manually.')
    }
  }, [amountDisplay, refLine])

  if (!dealId) return null

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <main className="min-h-screen bg-app1-bg-main p-6 md:p-10">
      <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins text-app1-text-main">
      <header className="sticky top-0 z-50 w-full border-b border-app1-border-light bg-app1-bg-card">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link to="/buyer/dashboard" className="font-cinzel text-xl font-black text-app1-primary md:text-2xl">
            TRACT
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/buyer/marketplace"
              className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-text-muted transition-colors hover:text-app1-secondary"
            >
              Marketplace
            </Link>
            <button
              type="button"
              className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-text-muted transition-colors hover:text-app1-secondary"
              onClick={() => navigate('/buyer/dashboard')}
            >
              Portfolio
            </button>
            <span className="border-b-2 border-app1-secondary pb-1 font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-secondary">
              Transactions
            </span>
            <button
              type="button"
              className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-text-muted transition-colors hover:text-app1-secondary"
              onClick={() => {
                window.location.href = 'mailto:support@tract.com'
              }}
            >
              Advisory
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded p-1 text-app1-text-muted transition-colors hover:text-app1-secondary"
              aria-label="Search"
            >
              <Search className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            <div className="flex cursor-pointer items-center gap-2 active:opacity-80">
              <span className="hidden font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-secondary sm:inline">
                Account
              </span>
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-app1-border-light bg-app1-bg-soft">
                <img src={HEADER_AVATAR} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow flex-col items-center px-4 py-10 md:px-12">
        <div className="flex w-full max-w-[680px] flex-col items-center">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-app1-primary/15">
              <CheckCircle2 className="h-10 w-10 text-app1-primary" strokeWidth={2} aria-hidden />
            </div>
            <h1 className="mb-2 font-cinzel text-3xl font-black text-app1-primary">Contract routed successfully</h1>
            <p className="max-w-[540px] font-poppins text-base text-app1-text-muted">
              Your signed contract has been sent to {titleCompany}. Please complete your Earnest Money Deposit to
              activate the deal tracker.
            </p>
          </div>

          <section className="mb-4 w-full rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:scale-[1.01] hover:border-app1-secondary/40 md:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="mb-1 font-cinzel text-xl font-black text-app1-primary">Earnest money deposit</span>
              <span className="mb-1 font-cinzel text-5xl font-black leading-tight text-app1-secondary">$5,000</span>
              <span className="font-poppins text-sm text-app1-text-muted">Due within 48 hours of contract signing</span>
            </div>

            <div className="relative mt-10 rounded-lg border border-app1-border-light bg-app1-bg-soft p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="font-poppins text-xs font-black uppercase tracking-[0.2em] text-app1-text-muted">
                  Wire transfer instructions
                </span>
                <button
                  type="button"
                  onClick={copyAll}
                  className="flex shrink-0 items-center gap-1 font-poppins text-sm font-semibold text-app1-secondary transition-all hover:underline"
                >
                  <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Copy all
                </button>
              </div>
              <div className="space-y-4 border-t border-app1-border-light pt-4">
                {[
                  { label: 'Bank name', value: WIRE.bankName, mono: true },
                  {
                    label: 'Account number',
                    value: showAccount ? WIRE.accountFull : maskTail(WIRE.accountFull),
                    mono: true,
                    extra: (
                      <button
                        type="button"
                        onClick={() => setShowAccount((v) => !v)}
                        className="rounded p-1 text-app1-text-muted hover:text-app1-text-main"
                        aria-label={showAccount ? 'Hide account number' : 'Show account number'}
                      >
                        {showAccount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    ),
                  },
                  { label: 'Routing number', value: maskTail(WIRE.routingFull, 4), mono: true },
                  { label: 'Reference', value: refLine, mono: true },
                  { label: 'Amount', value: amountDisplay, mono: true, gold: true },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <span
                        className={`text-right font-poppins text-sm font-semibold tracking-wide text-app1-text-main ${
                          'gold' in row && row.gold ? 'text-app1-secondary' : ''
                        }`}
                      >
                        {row.value}
                      </span>
                      {'extra' in row ? row.extra : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-4 rounded-lg border border-app1-primary/30 bg-app1-primary/10 p-4">
              <Clock className="mt-0.5 h-6 w-6 shrink-0 text-app1-primary" strokeWidth={2} aria-hidden />
              <div className="min-w-0 flex-grow">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-primary">
                    48-hour deadline
                  </span>
                  <span className="font-poppins text-sm font-semibold text-app1-primary">{formatCountdown(remainingSec)}</span>
                </div>
                <p className="font-poppins text-[13px] leading-tight text-app1-text-muted">
                  Your deal tracker activates automatically when the title company confirms receipt of funds.
                </p>
              </div>
            </div>
          </section>

          <div className="flex w-full flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => toast.success('Title company has been notified of your wire intent.')}
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-app1-primary font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-app1-premium transition-all hover:bg-app1-primary/90"
            >
              Notify title company
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => void downloadEmd()}
              className="font-poppins text-sm text-app1-text-muted underline transition-colors hover:text-app1-text-main"
            >
              Download instructions (PDF)
            </button>
            <Link
              to={`/deals/${dealId}`}
              className="font-poppins text-sm font-semibold text-app1-secondary transition-colors hover:underline"
            >
              Open deal tracker
            </Link>
          </div>

          <div className="mt-10 text-center text-app1-text-muted">
            <p className="font-poppins text-sm italic">
              Questions? Contact TRACT advisory at{' '}
              <a href="mailto:closing@tract.app" className="text-app1-secondary hover:underline">
                closing@tract.app
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="w-full border-t border-app1-border-light bg-app1-bg-card py-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-12">
          <p className="text-center font-poppins text-sm text-app1-text-muted md:text-left">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/legal/terms" className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-text-muted transition-colors hover:text-app1-secondary">
              Terms of service
            </Link>
            <Link to="/legal/privacy" className="font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-text-muted transition-colors hover:text-app1-secondary">
              Privacy policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
      </main>
    </DashboardLayout>
  )
}
