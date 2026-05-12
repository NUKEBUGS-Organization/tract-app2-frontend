import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Building2,
  Download,
  HelpCircle,
  History,
  Hourglass,
  Landmark,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Shield,
  UserCircle,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const SIDEBAR_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDqJZL7ZEGf0VYdfnM1kHH1f9kCww_JfHWL42-7mcnnmr4FmxKT--G98kWRVzxF-lI507EPd1yqllQu_j4N7VJXxkj2NzVwpNAnAniUvRebI4OxcDWawf6sjr_A7HrL14uTrBh2O6B1mz3ge1cSGtY-u2P-Lfl67M6JtqW_ZimDH7NuTedfY31jZdy3OPtKYtl_karj3uzZbxv3MnXEPZW-fzLhXSaEzSWVwzBwC8I7ZGfPMWpKeGWw3henu7JRtODlonebFGuoFsE'

const BAR_HEIGHTS_PCT = [40, 65, 50, 85, 45, 70, 95, 60, 55, 75, 80, 40] as const
const BAR_TOOLTIPS: (string | null)[] = ['W1', null, null, 'W4', null, null, 'Peak', null, null, null, null, null]

type LedgerRow = {
  id: string
  user: string
  type: string
  amount: number
  status: 'collected' | 'pending' | 'failed'
  date: string
  deal: string
}

const LEDGER_ROWS: LedgerRow[] = [
  {
    id: '1',
    user: 'Marcus Thompson',
    type: 'Platform fee (2nd deal)',
    amount: 500,
    status: 'collected',
    date: 'Oct 24, 2023',
    deal: 'DL-9022',
  },
  {
    id: '2',
    user: 'Alex Kim',
    type: 'Reactivation fee',
    amount: 50,
    status: 'collected',
    date: 'Oct 23, 2023',
    deal: 'DL-1104',
  },
  {
    id: '3',
    user: 'Taylor Rodriguez',
    type: 'Platform fee',
    amount: 500,
    status: 'pending',
    date: 'Oct 23, 2023',
    deal: 'DL-8891',
  },
  {
    id: '4',
    user: 'Jordan Martinez',
    type: 'Platform fee',
    amount: 500,
    status: 'failed',
    date: 'Oct 22, 2023',
    deal: 'DL-7723',
  },
]

function StatusChip({ status }: { status: LedgerRow['status'] }) {
  if (status === 'collected') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF3DE] px-2 py-1 font-inter text-[10px] font-bold uppercase text-[#2D5016]">
        Collected ✓
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#733641]/20 px-2 py-1 font-inter text-[10px] font-bold uppercase text-[#E67E22]">
        Pending
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#93000a] px-2 py-1 font-inter text-[10px] font-bold uppercase text-white">
      Failed ✗
    </span>
  )
}

export default function AdminFinancialLedgerPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const onSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navInactive =
    'flex items-center gap-3 rounded p-3 font-inter text-xs font-bold uppercase tracking-wide text-gray-400 transition-colors hover:bg-[#272A2E] hover:text-gray-100'

  return (
    <div className="min-h-screen bg-tract-alabaster font-inter text-tract-obsidian">
      <aside className="admin-penalty-scroll fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col overflow-y-auto border-r border-[#4d4635] bg-[#0B0E11] py-8 pl-4 pr-3 md:flex">
        <div className="mb-10 px-2">
          <div className="mb-4 flex items-center gap-3">
            <img src={SIDEBAR_AVATAR} alt="" className="h-10 w-10 rounded-full border border-[#4d4635] object-cover" />
            <div>
              <h1 className="font-playfair text-lg font-bold leading-tight text-tract-gold">TRACT App 2</h1>
              <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-[#d0c5af]/80">Super admin console</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5">
          <Link to="/admin/dashboard" className={navInactive}>
            <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Overview
          </Link>
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('All deals view coming soon.')}>
            <Building2 className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            All deals
          </button>
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('Pending listings coming soon.')}>
            <Hourglass className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Pending listings
          </button>
          <Link to="/admin/verification-queue" className={navInactive}>
            <BadgeCheck className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Verification queue
          </Link>
          <Link to="/admin/penalty-log" className={navInactive}>
            <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Penalty log
          </Link>
          <Link to="/admin/chat-surveillance" className={navInactive}>
            <Shield className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Chat surveillance
          </Link>
          <Link
            to="/admin/financial-ledger"
            className="flex items-center gap-3 rounded-l border-r-2 border-tract-gold bg-[#272A2E] p-3 font-inter text-xs font-bold uppercase tracking-wide text-tract-gold"
          >
            <Landmark className="h-5 w-5 shrink-0 text-tract-gold" strokeWidth={1.75} aria-hidden />
            Financial ledger
          </Link>
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('State firewall coming soon.')}>
            <LayoutGrid className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            State firewall
          </button>
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('User management coming soon.')}>
            <Users className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            User management
          </button>
        </nav>
        <div className="mt-auto space-y-0.5 border-t border-[#4d4635] pt-8">
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('Admin settings coming soon.')}>
            <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Settings
          </button>
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('Support portal coming soon.')}>
            <HelpCircle className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Support
          </button>
          <button type="button" onClick={onSignOut} className={cn('mb-2 w-full text-left', navInactive)}>
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-40 flex w-full flex-wrap items-center justify-between gap-4 border-b border-[#4d4635] bg-[#111417] px-4 py-3 md:px-8">
          <h2 className="font-playfair text-xl font-bold text-gray-100">Financial ledger</h2>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="relative">
              <input
                type="search"
                placeholder="Search transactions..."
                className="w-52 border-0 border-b border-[#4d4635] bg-[#191c1f] py-2 pl-3 pr-10 font-inter text-sm text-gray-200 placeholder:text-gray-500 focus:border-tract-gold focus:outline-none focus:ring-0 md:w-64"
                onChange={() => toast.message('Transaction search coming soon.')}
              />
              <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" strokeWidth={2} aria-hidden />
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <button type="button" className="hover:text-tract-gold" aria-label="Notifications">
                <Bell className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <button type="button" className="hover:text-tract-gold" aria-label="History" onClick={() => toast.message('Ledger history coming soon.')}>
                <History className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <button type="button" className="hover:text-tract-gold" aria-label="Account">
                <UserCircle className="h-6 w-6" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 pb-24 md:px-12 md:pb-12">
          <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-playfair text-2xl font-bold text-tract-obsidian">Financial ledger</h3>
              <p className="mt-1 font-inter text-sm text-gray-500">Review platform revenue and real-time transaction processing.</p>
            </div>
            <button
              type="button"
              onClick={() => toast.success('CSV export queued (demo).')}
              className="inline-flex items-center justify-center gap-2 border border-[#2C2C2E] px-5 py-2.5 font-inter text-sm font-semibold text-tract-obsidian transition-colors hover:bg-[#191c1f]/10"
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex h-40 flex-col justify-between border border-transparent bg-[#0B0E11] p-6 transition-all hover:scale-[1.02] hover:border-tract-gold/60">
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Total revenue</span>
              <span className="font-playfair text-4xl font-bold text-tract-gold md:text-5xl">$47,200</span>
            </div>
            <div className="flex h-40 flex-col justify-between border border-transparent bg-[#0B0E11] p-6 transition-all hover:scale-[1.02] hover:border-tract-gold/60">
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Platform fees collected</span>
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-3xl font-bold text-gray-100 md:text-4xl">94</span>
                <span className="font-inter text-base text-gray-500">transactions</span>
              </div>
            </div>
            <div className="flex h-40 flex-col justify-between border border-transparent bg-[#0B0E11] p-6 transition-all hover:scale-[1.02] hover:border-tract-gold/60">
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Pending withdrawals</span>
              <span className="font-playfair text-3xl font-bold text-[#E67E22] md:text-4xl">$3,500</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#4d4635]/20 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h4 className="font-playfair text-xl font-bold text-tract-obsidian">Platform revenue — Last 30 days</h4>
              <span className="flex items-center gap-2 font-inter text-xs font-bold uppercase tracking-wide text-gray-500">
                <span className="h-3 w-3 bg-tract-gold" aria-hidden />
                Revenue
              </span>
            </div>
            <div className="flex h-64 items-end justify-between gap-1 px-2 md:gap-2 md:px-4">
              {BAR_HEIGHTS_PCT.map((h, i) => (
                <div
                  key={i}
                  className="group relative w-full bg-tract-gold transition-opacity hover:opacity-80"
                  style={{ height: `${h}%` }}
                >
                  {BAR_TOOLTIPS[i] ? (
                    <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded bg-[#0B0E11] px-2 py-1 font-mono text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {BAR_TOOLTIPS[i]}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-[#4d4635]/30 pt-3">
              {['Week 01', 'Week 02', 'Week 03', 'Week 04'].map((w) => (
                <span key={w} className="font-inter text-xs font-bold uppercase tracking-wide text-gray-500">
                  {w}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#4d4635]/20 bg-white shadow-sm">
            <div className="border-b border-[#4d4635]/10 bg-black/[0.03] p-6">
              <h4 className="font-playfair text-xl font-bold text-tract-obsidian">Recent ledger activities</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#4d4635]/10 bg-black/[0.03]">
                    {['User', 'Type', 'Amount', 'Status', 'Date', 'Deal'].map((col) => (
                      <th key={col} className="p-4 font-inter text-xs font-bold uppercase tracking-wide text-gray-500 md:p-6">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-inter text-sm text-tract-obsidian">
                  {LEDGER_ROWS.map((row) => (
                    <tr key={row.id} className="border-b border-[#4d4635]/10 transition-colors hover:bg-[#191c1f]/5">
                      <td className="p-4 font-semibold md:p-6">{row.user}</td>
                      <td className="p-4 capitalize md:p-6">{row.type}</td>
                      <td className="p-4 font-mono font-semibold md:p-6">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(row.amount)}
                      </td>
                      <td className="p-4 md:p-6">
                        <StatusChip status={row.status} />
                      </td>
                      <td className="p-4 text-gray-500 md:p-6">{row.date}</td>
                      <td className="p-4 md:p-6">
                        <button
                          type="button"
                          className="cursor-pointer font-inter text-gray-500 underline decoration-gray-400 underline-offset-4 hover:text-tract-gold"
                          onClick={() => toast.message(`Deal ${row.deal} detail coming soon.`)}
                        >
                          {row.deal}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center border-t border-[#4d4635]/10 bg-black/[0.03] p-6">
              <button
                type="button"
                onClick={() => toast.message('Full audit trail coming soon.')}
                className="font-inter text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-tract-gold"
              >
                View full audit trail
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-[#4d4635] bg-[#0B0E11] px-4 py-3 md:hidden" aria-label="Mobile admin">
        <Link to="/admin/financial-ledger" className="flex flex-col items-center gap-1 text-tract-gold">
          <Landmark className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-[10px] font-bold uppercase tracking-wide">Ledger</span>
        </Link>
        <Link to="/admin/dashboard" className="flex flex-col items-center gap-1 text-gray-500">
          <LayoutDashboard className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-[10px] font-bold uppercase tracking-wide">Home</span>
        </Link>
        <button type="button" className="flex flex-col items-center gap-1 text-gray-500" onClick={() => toast.message('User management coming soon.')}>
          <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-inter text-[10px] font-bold uppercase tracking-wide">Users</span>
        </button>
      </nav>
    </div>
  )
}
