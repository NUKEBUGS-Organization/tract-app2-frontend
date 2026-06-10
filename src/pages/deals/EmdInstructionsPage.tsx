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
      <main className="min-h-screen bg-tract-alabaster p-6 md:p-10">
      <div className="flex min-h-screen flex-col bg-[#111417] font-inter text-gray-200">
      <header className="sticky top-0 z-50 w-full border-b border-[#4d4635] bg-[#111417]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link to="/buyer/dashboard" className="font-playfair text-xl font-bold text-tract-gold md:text-2xl">
            TRACT
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/buyer/marketplace"
              className="font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af] transition-colors hover:text-tract-gold"
            >
              Marketplace
            </Link>
            <button
              type="button"
              className="font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af] transition-colors hover:text-tract-gold"
              onClick={() => navigate('/buyer/dashboard')}
            >
              Portfolio
            </button>
            <span className="border-b-2 border-tract-gold pb-1 font-inter text-xs font-bold uppercase tracking-wider text-tract-gold">
              Transactions
            </span>
            <button
              type="button"
              className="font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af] transition-colors hover:text-tract-gold"
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
              className="rounded p-1 text-[#d0c5af] transition-colors hover:text-tract-gold"
              aria-label="Search"
            >
              <Search className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            </button>
            <div className="flex cursor-pointer items-center gap-2 active:opacity-80">
              <span className="hidden font-inter text-xs font-bold uppercase tracking-wider text-tract-gold sm:inline">
                Account
              </span>
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#4d4635] bg-[#323538]">
                <img src={HEADER_AVATAR} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow flex-col items-center px-4 py-10 md:px-12">
        <div className="flex w-full max-w-[680px] flex-col items-center">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#95BF78]">
              <CheckCircle2 className="h-10 w-10 text-[#163801]" strokeWidth={2} aria-hidden />
            </div>
            <h1 className="mb-2 font-playfair text-3xl font-bold text-gray-100">Contract routed successfully</h1>
            <p className="max-w-[540px] font-inter text-base text-[#d0c5af]">
              Your signed contract has been sent to {titleCompany}. Please complete your Earnest Money Deposit to
              activate the deal tracker.
            </p>
          </div>

          <section className="mb-4 w-full rounded-xl border border-[#4d4635] bg-[#272A2E] p-6 transition-all duration-300 hover:scale-[1.01] hover:border-tract-gold md:p-10">
            <div className="flex flex-col items-center text-center">
              <span className="mb-1 font-playfair text-xl font-bold text-gray-100">Earnest money deposit</span>
              <span className="mb-1 font-playfair text-5xl font-bold leading-tight text-tract-gold">$5,000</span>
              <span className="font-inter text-sm text-[#d0c5af]">Due within 48 hours of contract signing</span>
            </div>

            <div className="relative mt-10 rounded-lg border border-[#4d4635]/30 bg-[#191C1F] p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#d0c5af]">
                  Wire transfer instructions
                </span>
                <button
                  type="button"
                  onClick={copyAll}
                  className="flex shrink-0 items-center gap-1 font-inter text-sm font-semibold text-tract-gold transition-all hover:underline"
                >
                  <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Copy all
                </button>
              </div>
              <div className="space-y-4 border-t border-[#4d4635]/20 pt-4">
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
                        className="rounded p-1 text-[#d0c5af] hover:text-gray-100"
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
                    <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#d0c5af]">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-2 sm:justify-end">
                      <span
                        className={`text-right font-inter text-sm font-semibold tracking-wide text-gray-100 ${
                          'gold' in row && row.gold ? 'text-tract-gold' : ''
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

            <div className="mt-4 flex gap-4 rounded-lg border border-[#95BF78]/30 bg-[#95BF78]/20 p-4">
              <Clock className="mt-0.5 h-6 w-6 shrink-0 text-[#a8d38a]" strokeWidth={2} aria-hidden />
              <div className="min-w-0 flex-grow">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="font-inter text-xs font-bold uppercase tracking-wider text-[#a8d38a]">
                    48-hour deadline
                  </span>
                  <span className="font-inter text-sm font-semibold text-[#b0db91]">{formatCountdown(remainingSec)}</span>
                </div>
                <p className="font-inter text-[13px] leading-tight text-gray-200">
                  Your deal tracker activates automatically when the title company confirms receipt of funds.
                </p>
              </div>
            </div>
          </section>

          <div className="flex w-full flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => toast.success('Title company has been notified of your wire intent.')}
              className="group flex h-14 w-full items-center justify-center gap-2 bg-[#2b4e14] font-inter text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#95BF78] hover:text-[#163801]"
            >
              Notify title company
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => toast.info('PDF download available once document generation is enabled.')}
              className="font-inter text-sm text-[#d0c5af] underline transition-colors hover:text-gray-100"
            >
              Download instructions (PDF)
            </button>
            <Link
              to={`/deals/${dealId}`}
              className="font-inter text-sm font-semibold text-tract-gold transition-colors hover:underline"
            >
              Open deal tracker
            </Link>
          </div>

          <div className="mt-10 text-center text-[#d0c5af]">
            <p className="font-inter text-sm italic">
              Questions? Contact TRACT advisory at{' '}
              <a href="mailto:closing@tract.app" className="text-tract-gold hover:underline">
                closing@tract.app
              </a>
            </p>
          </div>
        </div>
      </div>

      <footer className="w-full border-t border-[#4d4635] bg-[#0B0E11] py-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-12">
          <p className="text-center font-inter text-sm text-[#d0c5af] md:text-left">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/legal/terms" className="font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af] transition-colors hover:text-tract-gold">
              Terms of service
            </Link>
            <Link to="/legal/privacy" className="font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af] transition-colors hover:text-tract-gold">
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
