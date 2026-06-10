import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
  Landmark,
  LayoutDashboard,
  Loader2,
  Search,
  UserCircle,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { formatCurrency } from '@/lib/utils'
import { useFinancialLedger, type LedgerEntry } from '@/hooks/useAdmin'

function StatusChip({ entry }: { entry: LedgerEntry }) {
  const collected = entry.totalPaid > 0
  if (collected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF3DE] px-2 py-1 font-inter text-[10px] font-bold uppercase text-[#2D5016]">
        Collected ✓
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-inter text-[10px] font-bold uppercase text-gray-500">
      —
    </span>
  )
}

export default function AdminFinancialLedgerPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = useFinancialLedger(page, 20)

  const summary = data?.summary
  const entries = data?.entries ?? []
  const pages = data?.pages ?? 1

  const barHeights = useMemo(() => {
    const max = Math.max(...entries.map((e) => e.totalPaid), 1)
    return entries.slice(0, 12).map((e) => Math.round((e.totalPaid / max) * 100) || 8)
  }, [entries])

  if (isLoading && !data) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter text-tract-obsidian">
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter text-tract-obsidian">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="font-inter text-gray-500">Failed to load financial ledger.</p>
          <button type="button" onClick={() => void refetch()} className="text-tract-gold font-inter text-sm font-bold uppercase">
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter text-tract-obsidian">
      <main className="min-h-screen px-4 py-8 md:p-10">
        <header className="sticky top-0 z-40 -mx-4 mb-6 flex w-full flex-wrap items-center justify-between gap-4 border-b border-[#4d4635] bg-[#111417] px-4 py-3 md:-mx-10 md:px-8">
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
              <p className="mt-1 font-inter text-sm text-gray-500">Platform revenue and fee payers (page {page} of {pages}).</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!entries.length) {
                  toast.error('No data to export.')
                  return
                }
                const headers = ['Name', 'Email', 'Role', 'Total Paid', 'Deals Closed']
                const rows = entries.map((e) => [
                  e.fullName,
                  e.email,
                  e.role,
                  e.totalPaid,
                  e.dealsClosed,
                ])
                const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `tract-ledger-${new Date().toISOString().slice(0, 10)}.csv`
                a.click()
                URL.revokeObjectURL(url)
                toast.success('CSV exported successfully.')
              }}
              className="inline-flex items-center justify-center gap-2 border border-[#2C2C2E] px-5 py-2.5 font-inter text-sm font-semibold text-tract-obsidian transition-colors hover:bg-[#191c1f]/10"
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
              Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex h-40 flex-col justify-between border border-transparent bg-[#0B0E11] p-6 transition-all hover:scale-[1.02] hover:border-tract-gold/60">
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Total revenue</span>
              <span className="font-playfair text-4xl font-bold text-tract-gold md:text-5xl">{formatCurrency(summary?.totalRevenue ?? 0)}</span>
            </div>
            <div className="flex h-40 flex-col justify-between border border-transparent bg-[#0B0E11] p-6 transition-all hover:scale-[1.02] hover:border-tract-gold/60">
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Fee payers</span>
              <div className="flex items-baseline gap-2">
                <span className="font-playfair text-3xl font-bold text-gray-100 md:text-4xl">{summary?.feePayerCount ?? 0}</span>
                <span className="font-inter text-base text-gray-500">users</span>
              </div>
            </div>
            <div className="flex h-40 flex-col justify-between border border-transparent bg-[#0B0E11] p-6 transition-all hover:scale-[1.02] hover:border-tract-gold/60">
              <span className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">Closed deals (platform)</span>
              <span className="font-playfair text-3xl font-bold text-[#E67E22] md:text-4xl">{summary?.closedDeals ?? 0}</span>
            </div>
          </div>

          <div className="rounded-xl border border-[#4d4635]/20 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h4 className="font-playfair text-xl font-bold text-tract-obsidian">Top fee contributors (this page)</h4>
              <span className="flex items-center gap-2 font-inter text-xs font-bold uppercase tracking-wide text-gray-500">
                <span className="h-3 w-3 bg-tract-gold" aria-hidden />
                Lifetime paid
              </span>
            </div>
            <div className="flex h-64 items-end justify-between gap-1 px-2 md:gap-2 md:px-4">
              {(barHeights.length ? barHeights : [40, 55, 45, 70, 50, 60, 35, 48, 52, 44, 58, 42]).map((h, i) => (
                <div key={i} className="group relative w-full bg-tract-gold transition-opacity hover:opacity-80" style={{ height: `${h}%` }}>
                  <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded bg-[#0B0E11] px-2 py-1 font-mono text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {entries[i]?.fullName?.split(' ')[0] ?? `U${i + 1}`}
                  </div>
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
            <p className="mt-2 text-center font-inter text-xs text-gray-400">Avg fee / closed deal: {formatCurrency(summary?.averageFee ?? 0)}</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#4d4635]/20 bg-white shadow-sm">
            <div className="border-b border-[#4d4635]/10 bg-black/[0.03] p-6 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-playfair text-xl font-bold text-tract-obsidian">Recent ledger activities</h4>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="rounded border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#4d4635]/10 bg-black/[0.03]">
                    {['User', 'Role', 'Amount', 'Status', 'Date', 'Deals closed'].map((col) => (
                      <th key={col} className="p-4 font-inter text-xs font-bold uppercase tracking-wide text-gray-500 md:p-6">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-inter text-sm text-tract-obsidian">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No fee payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    entries.map((row) => (
                      <tr key={row.id} className="border-b border-[#4d4635]/10 transition-colors hover:bg-[#191c1f]/5">
                        <td className="p-4 font-semibold md:p-6">{row.fullName}</td>
                        <td className="p-4 capitalize md:p-6">{row.role}</td>
                        <td className="p-4 font-mono font-semibold md:p-6">{formatCurrency(row.totalPaid)}</td>
                        <td className="p-4 md:p-6">
                          <StatusChip entry={row} />
                        </td>
                        <td className="p-4 text-gray-500 md:p-6">
                          {row.lastActiveAt ? new Date(row.lastActiveAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="p-4 md:p-6">
                          <button
                            type="button"
                            className="cursor-pointer font-inter text-gray-500 underline decoration-gray-400 underline-offset-4 hover:text-tract-gold"
                            onClick={() => toast.message(`${row.dealsClosed} deals closed for this user.`)}
                          >
                            {row.dealsClosed}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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
      </main>
    </DashboardLayout>
  )
}
