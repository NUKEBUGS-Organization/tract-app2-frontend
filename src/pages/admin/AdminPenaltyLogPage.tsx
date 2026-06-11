import { useMemo, useState } from 'react'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'
import { usePenaltyLog, useResolvePenalty, type PenaltyDetail } from '@/hooks/useAdmin'

const ADMIN_AVATAR = DEFAULT_AVATAR_IMAGE

type FilterId = 'all' | 'bans' | 'voided' | 'emd' | 'score' | 'resolved'

type PenaltyRow = {
  id: string
  initials: string
  name: string
  role: string
  violation: string
  vioId: string
  penaltyLabel: string
  penaltyClass: string
  date: string
  status: 'active' | 'review' | 'resolved'
  statusDisplay: string
  statusClass: string
  statusDot?: boolean
  borderClass: string
  tags: FilterId[]
  action: 'review' | 'view'
  raw: PenaltyDetail
}

const FILTER_OPTIONS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bans', label: 'Active bans' },
  { id: 'voided', label: 'Voided deals' },
  { id: 'emd', label: 'EMD forfeiture' },
  { id: 'score', label: 'Score penalties' },
  { id: 'resolved', label: 'Resolved' },
]

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (p.length === 0) return '??'
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

function mapPenalty(p: PenaltyDetail): PenaltyRow {
  const tags: FilterId[] = ['all']
  if (p.banApplied) tags.push('bans')
  if (p.automatedPenalties?.includes('void_deal')) tags.push('voided')
  if (p.automatedPenalties?.includes('flag_emd_forfeiture')) tags.push('emd')
  if (p.scoreDeduction > 0) tags.push('score')
  if (p.resolved) tags.push('resolved')

  const status: PenaltyRow['status'] = p.resolved ? 'resolved' : p.banApplied ? 'active' : 'review'
  const statusDisplay = p.resolved ? 'Resolved ✓' : p.banApplied ? 'Active' : 'Under review'
  const statusClass = p.resolved
    ? 'text-[#2b4e14] bg-[#95BF78]/10'
    : p.banApplied
      ? 'text-tract-red bg-tract-red/5'
      : 'text-amber-600 bg-amber-500/5'
  const borderClass = p.resolved ? 'border-l-4 border-[#95BF78]' : p.banApplied ? 'border-l-4 border-tract-red' : 'border-l-4 border-amber-500'

  const penaltyLabel =
    p.automatedPenalties?.length ? p.automatedPenalties.map((a) => a.replace(/_/g, ' ')).join(' · ') : p.violationLabel

  return {
    id: p.id,
    initials: initials(p.userName),
    name: p.userName,
    role: p.userRole,
    violation: p.violationLabel,
    vioId: `TRACT-VIO-${p.id.slice(-4)}`,
    penaltyLabel,
    penaltyClass: p.banApplied ? 'bg-tract-red/10 text-tract-red' : 'bg-amber-500/10 text-amber-600',
    date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status,
    statusDisplay,
    statusClass,
    statusDot: !p.resolved && p.banApplied,
    borderClass,
    tags,
    action: p.resolved ? 'view' : 'review',
    raw: p,
  }
}

export default function AdminPenaltyLogPage() {
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, refetch } = usePenaltyLog(page, 20)
  const resolvePenalty = useResolvePenalty()

  const [filter, setFilter] = useState<FilterId>('all')
  const [search, setSearch] = useState('')
  const [modalPenalty, setModalPenalty] = useState<PenaltyDetail | null>(null)

  const displayName = user?.fullName?.trim() || 'Admin User'

  const rows = useMemo(() => (data?.penalties ?? []).map(mapPenalty), [data?.penalties])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== 'all' && !r.tags.includes(filter)) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.vioId.toLowerCase().includes(q) ||
        r.violation.toLowerCase().includes(q) ||
        r.raw.userEmail.toLowerCase().includes(q)
      )
    })
  }, [filter, search, rows])

  const total = data?.total ?? 0
  const pages = data?.pages ?? 1

  const openRow = (row: PenaltyRow) => {
    if (row.action === 'view') {
      setModalPenalty(row.raw)
      return
    }
    setModalPenalty(row.raw)
  }

  if (isLoading && !data) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-theme-bg font-inter text-theme-muted">
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-theme-bg font-inter text-theme-muted">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="font-inter text-theme-muted">Failed to load penalty log.</p>
          <button type="button" onClick={() => void refetch()} className="text-tract-gold font-inter text-sm font-bold uppercase">
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-theme-bg font-inter text-theme-muted selection:bg-tract-gold/30 selection:text-theme-text">
      <>
        <main className="min-h-screen px-4 py-8 md:p-10">
          <header className="sticky top-0 z-10 -mx-4 mb-6 flex h-16 items-center justify-between border-b border-theme-border bg-theme-topbar px-4 md:-mx-10 md:px-10">
            <div className="relative max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-theme-muted" strokeWidth={1.75} aria-hidden />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs, IDs, or users..."
                className="w-full rounded-lg border-0 bg-theme-surface-2 py-2 pl-10 pr-4 font-inter text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-tract-gold"
              />
            </div>
            <div className="ml-4 flex items-center gap-4 md:gap-6">
              <button type="button" className="relative rounded-full p-2 text-theme-muted hover:bg-theme-surface-2" aria-label="Notifications">
                <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-tract-red" aria-hidden />
              </button>
              <button type="button" className="rounded-full p-2 text-theme-muted hover:bg-theme-surface-2" aria-label="Filters" onClick={() => toast.message('Filter presets coming soon.')}>
                <SlidersHorizontal className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </button>
              <div className="hidden h-8 w-px bg-gray-200 md:block" aria-hidden />
              <div className="flex items-center gap-2">
                <img src={ADMIN_AVATAR} alt="" className="h-10 w-10 rounded-full border-2 border-tract-gold object-cover" />
                <div className="hidden lg:block">
                  <p className="font-inter text-sm font-bold leading-none text-theme-text">{displayName}</p>
                  <p className="mt-1 font-inter text-[10px] font-bold uppercase tracking-wider text-theme-muted">Super admin</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mb-10">
            <h2 className="mb-2 font-playfair text-[28px] font-bold text-theme-text">Automated penalty log</h2>
            <p className="font-inter text-base text-theme-muted">System-enforced penalties from the database.</p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'rounded-full px-5 py-2 font-inter text-sm font-semibold transition-colors',
                  filter === f.id ? 'bg-theme-surface text-white shadow-sm' : 'border border-theme-border bg-theme-card text-theme-muted hover:bg-theme-surface-2',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-theme-border bg-theme-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="bg-theme-surface text-white">
                    {['User', 'Violation', 'Penalty applied', 'Date', 'Status', 'Action'].map((h) => (
                      <th key={h} className={cn('px-6 py-4 font-inter text-xs font-bold uppercase tracking-wider', h === 'Action' && 'text-right')}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {filtered.map((row) => (
                    <tr key={row.id} className={cn('transition-colors hover:bg-theme-surface-2/50', row.borderClass)}>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-surface-2 font-inter text-sm font-bold text-theme-text">{row.initials}</div>
                          <div>
                            <p className="font-inter font-bold text-theme-text">{row.name}</p>
                            <p className="font-inter text-xs text-theme-muted">{row.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-theme-text">{row.violation}</p>
                        <p className="font-mono text-[10px] text-theme-muted">{row.vioId}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn('inline-block rounded px-2 py-1 font-inter text-[11px] font-bold uppercase', row.penaltyClass)}>{row.penaltyLabel}</span>
                      </td>
                      <td className="px-6 py-6 font-inter text-sm text-theme-muted">{row.date}</td>
                      <td className="px-6 py-6">
                        <div className={cn('inline-flex w-fit items-center gap-1 rounded px-2 py-1 font-inter text-xs font-bold', row.statusClass)}>
                          {row.statusDot ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tract-red" aria-hidden /> : null}
                          {row.statusDisplay}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <button
                          type="button"
                          onClick={() => openRow(row)}
                          className={cn(
                            'rounded-lg px-4 py-1.5 font-inter text-xs font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95',
                            row.action === 'review' ? 'bg-tract-gold text-[#3c2f00]' : 'bg-theme-surface-2 text-theme-text hover:bg-theme-surface-2',
                          )}
                        >
                          {row.action === 'review' ? 'Review' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-theme-border bg-theme-surface-2 px-6 py-3">
              <p className="font-inter text-xs font-bold uppercase tracking-wider text-theme-muted">
                Page {page} of {pages} · {filtered.length} on this page · {total} total
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-theme-border p-1.5 text-theme-muted hover:bg-theme-topbar disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="rounded border border-theme-border p-1.5 text-theme-muted hover:bg-theme-topbar disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </main>

        {modalPenalty ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-surface/60 p-4 backdrop-blur-sm" role="dialog" aria-modal aria-labelledby="penalty-modal-title">
            <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-theme-border bg-theme-topbar shadow-xl">
              <div className="flex items-center justify-between bg-theme-surface px-8 py-5">
                <h3 id="penalty-modal-title" className="font-playfair text-xl font-bold text-white">
                  Penalty review — {modalPenalty.userName}
                </h3>
                <button type="button" onClick={() => setModalPenalty(null)} className="rounded p-1 text-white/60 transition-colors hover:text-white" aria-label="Close">
                  <X className="h-6 w-6" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <div className="space-y-6 p-8">
                <div className="flex gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-theme-surface-2 font-inter text-xl font-bold text-theme-text">{initials(modalPenalty.userName)}</div>
                  <div>
                    <p className="mb-1 font-inter text-[10px] font-bold uppercase tracking-widest text-theme-muted">Violation</p>
                    <p className="font-mono font-bold text-theme-text">{modalPenalty.violationLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded bg-tract-red/10 px-2 py-0.5 font-inter text-[10px] font-bold text-tract-red">{modalPenalty.violationType}</span>
                      <span className="rounded bg-theme-surface-2 px-2 py-0.5 font-inter text-[10px] font-bold uppercase text-theme-muted">{modalPenalty.userEmail}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-theme-border bg-theme-surface-2 p-6">
                  <h4 className="mb-2 font-inter text-sm font-bold text-theme-text">Automated actions</h4>
                  <p className="font-inter text-sm leading-relaxed text-theme-muted">
                    {modalPenalty.automatedPenalties?.length ? modalPenalty.automatedPenalties.join(', ') : 'None recorded'}
                  </p>
                  <p className="mt-3 font-inter text-sm text-theme-muted">Score deduction: {modalPenalty.scoreDeduction}</p>
                  {modalPenalty.resolutionNotes ? (
                    <p className="mt-2 font-inter text-sm text-theme-muted">Notes: {modalPenalty.resolutionNotes}</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-6 border-t border-theme-border pt-6">
                  <div>
                    <p className="mb-1 font-inter text-[10px] font-bold uppercase text-theme-muted">Ban applied</p>
                    <p className="font-inter font-bold text-theme-text">{modalPenalty.banApplied ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="mb-1 font-inter text-[10px] font-bold uppercase text-theme-muted">Created</p>
                    <p className="font-inter font-bold text-theme-text">{new Date(modalPenalty.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  {!modalPenalty.resolved ? (
                    <button
                      type="button"
                      disabled={resolvePenalty.isPending}
                      onClick={() => {
                        resolvePenalty.mutate(
                          { penaltyId: modalPenalty.id, notes: 'Resolved from admin penalty log' },
                          { onSuccess: () => setModalPenalty(null) },
                        )
                      }}
                      className="w-full rounded-xl bg-tract-red py-3 font-inter text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    >
                      Mark resolved
                    </button>
                  ) : (
                    <p className="text-center font-inter text-sm text-theme-muted">This penalty is already resolved.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalPenalty(null)}
                    className="w-full rounded-xl border border-theme-border py-3 font-inter text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface-2"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="border-t border-theme-border bg-theme-surface-2 px-8 py-4">
                <p className="text-center font-inter text-[10px] italic text-theme-muted">Deal: {modalPenalty.dealId ?? '—'} · Listing: {modalPenalty.listingId ?? '—'}</p>
              </div>
            </div>
          </div>
        ) : null}
      </>
    </DashboardLayout>
  )
}
