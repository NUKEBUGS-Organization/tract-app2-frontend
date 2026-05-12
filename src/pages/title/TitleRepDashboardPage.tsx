import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  CreditCard,
  FileText,
  Handshake,
  LayoutDashboard,
  Lock,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'

const SARAH_SIDEBAR = DEFAULT_AVATAR_IMAGE

const SARAH_HEADER = DEFAULT_AVATAR_IMAGE

const HERO_IMAGE = DEFAULT_PROPERTY_IMAGE

type DealFilter = 'all' | 'action' | 'track'

type DealRow = {
  id: string
  property: string
  buyer: string
  step: string
  nextAction: string
  timer: string
  advanceLabel: string | null
  dealLink: string
  /** needs action for filter */
  needsAction: boolean
}

const DEAL_ROWS: DealRow[] = [
  {
    id: 'd1',
    property: '4821 Maple Dr',
    buyer: 'Jordan M.',
    step: 'Step 3: Inspection',
    nextAction: 'Waiting for buyer',
    timer: '—',
    advanceLabel: null,
    dealLink: '/deals/under-contract-demo',
    needsAction: false,
  },
  {
    id: 'd2',
    property: '902 River Bend',
    buyer: 'Alex K.',
    step: 'Step 4: Appraisal',
    nextAction: 'Order appraisal',
    timer: '—',
    advanceLabel: 'Advance to Step 5',
    dealLink: '/deals/902-river-bend',
    needsAction: true,
  },
  {
    id: 'd3',
    property: '1240 Oak Ave',
    buyer: 'Taylor R.',
    step: 'Step 7: Clear to Close',
    nextAction: 'Issue CTC',
    timer: '—',
    advanceLabel: 'Mark CTC',
    dealLink: '/deals/1240-oak',
    needsAction: true,
  },
]

export default function TitleRepDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const displayName = user?.fullName?.trim() || 'Sarah Kim'
  const company = 'First American Title'

  const [dealFilter, setDealFilter] = useState<DealFilter>('all')

  const filteredDeals = useMemo(() => {
    if (dealFilter === 'all') return DEAL_ROWS
    if (dealFilter === 'action') return DEAL_ROWS.filter((r) => r.needsAction)
    return DEAL_ROWS.filter((r) => !r.needsAction)
  }, [dealFilter])

  const verifyYear = useMemo(() => new Date().getFullYear() + 1, [])

  const navLink = (
    to: string | null,
    label: string,
    icon: typeof LayoutDashboard,
    active?: boolean,
    onNav?: () => void,
  ) => {
    const Icon = icon
    const inner = (
      <>
        <Icon className="mr-3 h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="font-inter text-base">{label}</span>
      </>
    )
    const className = cn(
      'flex items-center px-6 py-4 transition-all active:scale-95',
      active
        ? 'border-r-2 border-tract-gold bg-[#272A2E] font-bold text-tract-gold'
        : 'font-medium text-gray-400 hover:bg-[#323538] hover:text-gray-100',
    )
    if (onNav) {
      return (
        <li key={label}>
          <button type="button" onClick={onNav} className={cn('w-full text-left', className)}>
            {inner}
          </button>
        </li>
      )
    }
    if (!to) {
      return (
        <li key={label}>
          <button type="button" className={cn('w-full cursor-default text-left', className)} aria-disabled>
            {inner}
          </button>
        </li>
      )
    }
    return (
      <li key={to + label}>
        <Link to={to} className={className}>
          {inner}
        </Link>
      </li>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] font-inter text-gray-200">
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-[#323538] bg-[#1D2023] py-10 md:flex">
        <div className="mb-10 px-6">
          <Link to="/title/dashboard" className="font-playfair text-2xl font-bold tracking-tight text-tract-gold">
            TRACT Title
          </Link>
          <p className="mt-1 font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Representative</p>
        </div>
        <nav className="flex-1">
          <ul className="space-y-1">
            {navLink('/title/dashboard', 'Dashboard', LayoutDashboard, true)}
            {navLink(null, 'Active deals', Handshake, false, () => toast.message('Active deals list coming soon.'))}
            {navLink(null, 'Pending EMDs', CreditCard, false, () => toast.message('EMD queue view coming soon.'))}
            {navLink(null, 'Documents', FileText, false, () => toast.message('Documents hub coming soon.'))}
            {navLink(null, 'Contact parties', Users, false, () => toast.message('Party directory coming soon.'))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-[#323538] px-6 pt-8">
          <div className="flex items-center gap-3">
            <img src={SARAH_SIDEBAR} alt="" className="h-10 w-10 shrink-0 rounded-full border border-tract-gold/20 object-cover" />
            <div className="min-w-0">
              <p className="truncate font-inter text-base font-bold text-gray-100">{displayName}</p>
              <p className="truncate font-inter text-xs text-gray-500">Title representative</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#323538] bg-[#111417] px-4 md:left-64 md:px-6">
        <h2 className="font-playfair text-xl font-bold text-tract-alabaster md:text-2xl">Title dashboard</h2>
        <div className="flex items-center gap-4 md:gap-8">
          <button
            type="button"
            onClick={() => toast.message('New deal intake coming soon.')}
            className="rounded-lg bg-tract-gold px-4 py-2 font-inter text-sm font-semibold text-[#554300] transition-all hover:brightness-110 active:scale-95"
          >
            New deal
          </button>
          <div className="flex cursor-pointer items-center gap-2">
            <span className="hidden max-w-[200px] truncate font-inter text-sm text-gray-400 sm:inline md:max-w-none">
              {displayName} · {company}
            </span>
            <img src={SARAH_HEADER} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          </div>
        </div>
      </header>

      <main className="min-h-screen px-4 pb-12 pt-20 md:ml-64 md:px-12 md:pt-20">
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: 'Active deals', value: '5', hover: 'hover:border-tract-gold', color: 'text-tract-gold' },
            { label: 'Pending EMDs', value: '2', hover: 'hover:border-tract-orange', color: 'text-tract-orange' },
            { label: 'Closing this week', value: '1', hover: 'hover:border-[#b0db91]', color: 'text-tract-green' },
          ].map((c) => (
            <div
              key={c.label}
              className={cn(
                'flex flex-col justify-between rounded-2xl border border-tract-graphite bg-tract-graphite p-6 transition-transform duration-300 hover:scale-[1.02]',
                c.hover,
              )}
            >
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">{c.label}</span>
              <span className={cn('mt-2 font-playfair text-5xl font-bold', c.color)}>{c.value}</span>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/5 bg-tract-graphite p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <h3 className="font-playfair text-2xl font-bold text-tract-alabaster">My active deals</h3>
            <div className="flex gap-2 rounded-lg bg-[#1D2023] p-1">
              {(
                [
                  { id: 'all' as const, label: 'All' },
                  { id: 'action' as const, label: 'Needs action' },
                  { id: 'track' as const, label: 'On track' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDealFilter(f.id)}
                  className={cn(
                    'rounded-md px-4 py-2 font-inter text-sm font-semibold transition-colors',
                    dealFilter === f.id ? 'bg-[#272A2E] text-tract-gold' : 'text-gray-500 hover:text-gray-200',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#323538]">
                  {['Property', 'Buyer', 'Current step', 'Next action', 'Timer', 'Advance'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'pb-4 font-inter text-xs font-bold uppercase tracking-wider text-gray-500',
                        h === 'Advance' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-inter text-sm text-gray-200">
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center font-inter text-sm text-gray-500">
                      No deals match this filter.
                    </td>
                  </tr>
                ) : null}
                {filteredDeals.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-white/5 transition-colors hover:bg-[#1D2023]/50',
                      idx === filteredDeals.length - 1 && 'border-b-0',
                    )}
                  >
                    <td className="py-5 font-bold">
                      <Link to={row.dealLink} className="text-gray-100 hover:text-tract-gold hover:underline">
                        {row.property}
                      </Link>
                    </td>
                    <td className="py-5">{row.buyer}</td>
                    <td className="py-5">
                      <span className="rounded border border-[#4d4635] bg-[#1D2023] px-2 py-1 text-xs">{row.step}</span>
                    </td>
                    <td className={cn('py-5', row.nextAction.startsWith('Waiting') && 'italic text-gray-500')}>
                      {row.nextAction}
                    </td>
                    <td className="py-5 text-gray-500">{row.timer}</td>
                    <td className="py-5 text-right">
                      {row.advanceLabel ? (
                        <button
                          type="button"
                          onClick={() => toast.success(`${row.advanceLabel} recorded.`)}
                          className="rounded-lg bg-tract-gold px-4 py-2 font-inter text-xs font-semibold text-black transition-all hover:brightness-110 active:scale-95"
                        >
                          {row.advanceLabel}
                        </button>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex gap-4 rounded-lg border-l-[3px] border-tract-rose bg-[#1D2023]/50 p-4">
            <Lock className="h-5 w-5 shrink-0 text-tract-rose" strokeWidth={2} aria-hidden />
            <p className="font-inter text-[13px] leading-snug text-tract-rose">
              You are the sole authority for pipeline steps 4 through 8. Buyers and wholesalers cannot advance these steps
              without your confirmation.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/5 bg-tract-graphite p-6 md:p-8">
          <h3 className="mb-6 font-playfair text-xl font-bold text-tract-alabaster">Pending EMD confirmations</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1D2023] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">Property</p>
                  <p className="font-bold text-gray-100">4821 Maple Dr</p>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">Amount</p>
                  <p className="font-inter text-sm font-semibold tracking-wide text-tract-gold">$5,000</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="rounded-full border border-tract-gold/20 bg-tract-gold/10 px-4 py-1.5 font-inter text-xs font-bold text-tract-gold">
                  Pending
                </span>
                <button
                  type="button"
                  onClick={() => toast.success('EMD receipt confirmed.')}
                  className="rounded-lg bg-tract-gold px-4 py-2 font-inter text-sm font-semibold text-[#554300] transition-all hover:brightness-110 active:scale-95"
                >
                  Confirm receipt
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-[#1D2023]/40 p-6 opacity-80 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">Property</p>
                  <p className="font-bold text-gray-100">902 River Bend</p>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">Amount</p>
                  <p className="font-inter text-sm font-semibold tracking-wide text-tract-gold">$8,500</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-tract-green/20 bg-tract-green-light/10 px-4 py-1.5 font-inter text-xs font-bold text-tract-green">
                  Received ✓
                </span>
                <span className="font-inter text-sm text-gray-500">—</span>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="group relative h-48 overflow-hidden rounded-xl">
            <img
              src={HERO_IMAGE}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111417] to-transparent opacity-60" aria-hidden />
            <div className="absolute bottom-4 left-4">
              <p className="font-playfair text-xl font-bold text-white">Institutional grade security</p>
              <p className="font-inter text-sm text-gray-400">Encrypted document vaults for all title disclosures.</p>
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-xl border border-[#323538] bg-[#1D2023] p-6">
            <div className="mb-2 flex items-center gap-3">
              <BadgeCheck className="h-6 w-6 shrink-0 text-tract-gold" strokeWidth={2} aria-hidden />
              <h4 className="font-playfair text-xl font-bold text-gray-100">Compliance status</h4>
            </div>
            <p className="mb-4 font-inter text-base text-gray-500">
              Your credentials as a title representative for {company} are active and verified through {verifyYear}.
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#323538]">
              <div className="h-full w-full bg-tract-gold" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
