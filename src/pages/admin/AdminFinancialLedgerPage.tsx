import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Landmark,
  LayoutDashboard,
  Loader2,
  Search,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/app1/PageHeader'
import StatCard from '@/components/app1/StatCard'
import { formatCurrency } from '@/lib/utils'
import { useFinancialLedger, type LedgerEntry } from '@/hooks/useAdmin'

function StatusChip({ entry }: { entry: LedgerEntry }) {
  const collected = entry.totalPaid > 0
  if (collected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-app1-primary/10 px-2 py-1 font-poppins text-[10px] font-bold uppercase text-app1-primary">
        Collected ✓
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-poppins text-[10px] font-bold uppercase text-amber-700">
      Pending
    </span>
  )
}

export default function AdminFinancialLedgerPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useFinancialLedger(page, 20)

  const summary = data?.summary
  const entries = data?.entries ?? []
  const pages = data?.pages ?? 1

  const displayEntries = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(
      (e) => e.fullName.toLowerCase().includes(q) || e.email.toLowerCase().includes(q),
    )
  }, [entries, search])

  const barHeights = useMemo(() => {
    const max = Math.max(...entries.map((e) => e.totalPaid), 1)
    return entries.slice(0, 12).map((e) => Math.round((e.totalPaid / max) * 100) || 8)
  }, [entries])

  if (isLoading && !data) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="font-poppins text-app1-text-muted">Failed to load financial ledger.</p>
          <button type="button" onClick={() => void refetch()} className="text-app1-secondary font-poppins text-sm font-bold uppercase">
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <main className="min-h-screen px-4 py-8 md:p-10">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <PageHeader
            eyebrow="Admin Workspace"
            title="Financial Ledger"
            description={`Platform revenue and fee payers (page ${page} of ${pages}).`}
            actions={
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-app1-border-light bg-app1-bg-card px-5 py-2.5 font-poppins text-sm font-semibold text-app1-text-main shadow-app1-card transition-colors hover:bg-app1-bg-soft"
              >
                <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
                Export CSV
              </button>
            }
          />

          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-app1-text-muted" strokeWidth={2} aria-hidden />
            <input
              type="search"
              placeholder="Search transactions..."
              value={search}
              className="w-full rounded-xl border border-app1-border-light bg-app1-bg-soft py-2.5 pl-10 pr-4 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-1 focus:ring-app1-secondary"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard
              label="Total revenue"
              value={formatCurrency(summary?.totalRevenue ?? 0)}
              note="Platform fees collected"
              icon={Wallet}
              tone="primary"
              featured
            />
            <StatCard
              label="Fee payers"
              value={summary?.feePayerCount ?? 0}
              note="Users with recorded payments"
              icon={Users}
              tone="neutral"
            />
            <StatCard
              label="Closed deals"
              value={summary?.closedDeals ?? 0}
              note="Platform-wide closed deals"
              icon={TrendingUp}
              tone="warning"
            />
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h4 className="font-cinzel text-xl font-bold text-app1-text-main">Top fee contributors (this page)</h4>
              <span className="flex items-center gap-2 font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-muted">
                <span className="h-3 w-3 bg-app1-secondary" aria-hidden />
                Lifetime paid
              </span>
            </div>
            <div className="flex h-64 items-end justify-between gap-1 px-2 md:gap-2 md:px-4">
              {(barHeights.length ? barHeights : [40, 55, 45, 70, 50, 60, 35, 48, 52, 44, 58, 42]).map((h, i) => (
                <div key={i} className="group relative w-full bg-app1-secondary transition-opacity hover:opacity-80" style={{ height: `${h}%` }}>
                  <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded bg-app1-bg-main px-2 py-1 font-mono text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {entries[i]?.fullName?.split(' ')[0] ?? `U${i + 1}`}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-app1-border-light pt-3">
              {['Week 01', 'Week 02', 'Week 03', 'Week 04'].map((w) => (
                <span key={w} className="font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-muted">
                  {w}
                </span>
              ))}
            </div>
            <p className="mt-2 text-center font-poppins text-xs text-app1-text-muted">Avg fee / closed deal: {formatCurrency(summary?.averageFee ?? 0)}</p>
          </div>

          <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
            <div className="border-b border-app1-border-light bg-app1-bg-soft p-6 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-cinzel text-xl font-bold text-app1-text-main">Recent ledger activities</h4>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-app1-border-light p-1.5 text-app1-text-muted hover:bg-app1-bg-soft disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="rounded border border-app1-border-light p-1.5 text-app1-text-muted hover:bg-app1-bg-soft disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                    {['User', 'Role', 'Amount', 'Status', 'Date', 'Deals closed'].map((col) => (
                      <th key={col} className="p-4 font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-muted md:p-6">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-poppins text-sm text-app1-text-main">
                  {displayEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-app1-text-muted">
                        No fee payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    displayEntries.map((row) => (
                      <tr key={row.id} className="border-b border-app1-border-light transition-colors hover:bg-app1-bg-soft/60">
                        <td className="p-4 font-semibold md:p-6">{row.fullName}</td>
                        <td className="p-4 capitalize md:p-6">{row.role}</td>
                        <td className="p-4 font-mono font-semibold md:p-6">{formatCurrency(row.totalPaid)}</td>
                        <td className="p-4 md:p-6">
                          <StatusChip entry={row} />
                        </td>
                        <td className="p-4 text-app1-text-muted md:p-6">
                          {row.lastActiveAt ? new Date(row.lastActiveAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="p-4 md:p-6">
                          <button
                            type="button"
                            className="cursor-pointer font-poppins text-app1-text-muted underline decoration-gray-400 underline-offset-4 hover:text-app1-secondary"
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
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-app1-border-light bg-app1-bg-main px-4 py-3 md:hidden" aria-label="Mobile admin">
          <Link to="/admin/ledger" className="flex flex-col items-center gap-1 text-app1-secondary">
            <Landmark className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            <span className="font-poppins text-[10px] font-bold uppercase tracking-wide">Ledger</span>
          </Link>
          <Link to="/admin/dashboard" className="flex flex-col items-center gap-1 text-app1-text-muted">
            <LayoutDashboard className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            <span className="font-poppins text-[10px] font-bold uppercase tracking-wide">Home</span>
          </Link>
          <button type="button" className="flex flex-col items-center gap-1 text-app1-text-muted" onClick={() => navigate('/admin/verification-queue')}>
            <Users className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            <span className="font-poppins text-[10px] font-bold uppercase tracking-wide">Users</span>
          </button>
        </nav>
      </main>
    </DashboardLayout>
  )
}
