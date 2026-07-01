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
import PageHeader from '@/components/app1/PageHeader'
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
    ? 'bg-app1-bg-soft text-app1-text-muted'
    : p.banApplied
      ? 'bg-app1-danger/10 text-app1-danger'
      : 'text-amber-600 bg-amber-500/5'
  const borderClass = p.resolved ? 'border-app1-primary' : p.banApplied ? 'border-app1-danger' : 'border-amber-500'

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
    penaltyClass: p.banApplied ? 'bg-app1-danger/10 text-app1-danger' : 'bg-amber-500/10 text-amber-600',
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
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-muted">
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-muted">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="font-poppins text-app1-text-muted">Failed to load penalty log.</p>
          <button type="button" onClick={() => void refetch()} className="text-app1-secondary font-poppins text-sm font-bold uppercase">
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-muted selection:bg-app1-secondary/30 selection:text-app1-text-main">
      <>
        <main className="min-h-screen px-4 py-8 md:p-10">
          <div className="mx-auto max-w-[1440px] space-y-6">
            <PageHeader
              eyebrow="Admin Workspace"
              title="Automated Penalty Log"
              description="System-enforced penalties from the database."
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative max-w-xl flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-app1-text-muted" strokeWidth={1.75} aria-hidden />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search logs, IDs, or users..."
                  className="w-full rounded-xl border border-app1-border-light bg-app1-bg-soft py-2 pl-10 pr-4 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:outline-none focus:ring-1 focus:ring-app1-secondary"
                />
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <button type="button" className="relative rounded-full p-2 text-app1-text-muted hover:bg-app1-bg-soft" aria-label="Notifications">
                  <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-app1-danger" aria-hidden />
                </button>
                <button type="button" className="rounded-full p-2 text-app1-text-muted hover:bg-app1-bg-soft" aria-label="Filters" onClick={() => toast.message('Filter presets coming soon.')}>
                  <SlidersHorizontal className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </button>
                <div className="hidden h-8 w-px bg-gray-200 md:block" aria-hidden />
                <div className="flex items-center gap-2">
                  <img src={ADMIN_AVATAR} alt="" className="h-10 w-10 rounded-full border-2 border-app1-secondary object-cover" />
                  <div className="hidden lg:block">
                    <p className="font-poppins text-sm font-bold leading-none text-app1-text-main">{displayName}</p>
                    <p className="mt-1 font-poppins text-[10px] font-bold uppercase tracking-wider text-app1-text-muted">Super admin</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'rounded-full px-5 py-2 font-poppins text-sm font-semibold transition-colors',
                    filter === f.id ? 'bg-app1-secondary text-app1-primary-dark shadow-sm' : 'border border-app1-border-light bg-app1-bg-card text-app1-text-muted hover:bg-app1-bg-soft',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-12 text-center shadow-app1-card">
                  <p className="font-poppins text-sm text-app1-text-muted">No penalties match this filter.</p>
                </div>
              ) : (
                filtered.map((row) => (
                  <div
                    key={row.id}
                    className={cn(
                      'flex flex-col justify-between gap-4 rounded-app1-card border-l-4 bg-app1-danger/5 p-6 shadow-app1-card transition-all sm:flex-row sm:items-center',
                      row.borderClass,
                    )}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app1-bg-soft font-poppins text-sm font-bold text-app1-text-main">{row.initials}</div>
                      <div className="min-w-0">
                        <p className="font-poppins text-sm font-black text-app1-text-main">
                          {row.violation} <span className="font-normal text-app1-text-muted">— {row.name}</span>
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-app1-text-muted">{row.vioId}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={cn('inline-block rounded-full px-2 py-1 font-poppins text-[11px] font-bold uppercase', row.penaltyClass)}>{row.penaltyLabel}</span>
                          <span className="font-poppins text-xs text-app1-text-muted">{row.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className={cn('inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 font-poppins text-xs font-bold uppercase tracking-wide', row.statusClass)}>
                        {row.statusDot ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-app1-danger" aria-hidden /> : null}
                        {row.statusDisplay}
                      </div>
                      <button
                        type="button"
                        onClick={() => openRow(row)}
                        className={cn(
                          'rounded-lg px-4 py-1.5 font-poppins text-xs font-semibold shadow-sm transition-all hover:opacity-90 active:scale-95',
                          row.action === 'review' ? 'bg-app1-secondary text-app1-primary-dark' : 'bg-app1-bg-soft text-app1-text-main hover:bg-app1-bg-soft',
                        )}
                      >
                        {row.action === 'review' ? 'Review' : 'View'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between rounded-app1-card border border-app1-border-light bg-app1-bg-card px-6 py-3 shadow-app1-card">
              <p className="font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">
                Page {page} of {pages} · {filtered.length} on this page · {total} total
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded border border-app1-border-light p-1.5 text-app1-text-muted hover:bg-app1-bg-card disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="rounded border border-app1-border-light p-1.5 text-app1-text-muted hover:bg-app1-bg-card disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </main>

        {modalPenalty ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-app1-bg-soft/60 p-4 backdrop-blur-sm" role="dialog" aria-modal aria-labelledby="penalty-modal-title">
            <div className="w-full max-w-[560px] overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-xl">
              <div className="flex items-center justify-between bg-app1-primary px-8 py-5">
                <h3 id="penalty-modal-title" className="font-cinzel text-xl font-bold text-white">
                  Penalty review — {modalPenalty.userName}
                </h3>
                <button type="button" onClick={() => setModalPenalty(null)} className="rounded p-1 text-white/60 transition-colors hover:text-white" aria-label="Close">
                  <X className="h-6 w-6" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <div className="space-y-6 p-8">
                <div className="flex gap-6">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-app1-bg-soft font-poppins text-xl font-bold text-app1-text-main">{initials(modalPenalty.userName)}</div>
                  <div>
                    <p className="mb-1 font-poppins text-[10px] font-bold uppercase tracking-widest text-app1-text-muted">Violation</p>
                    <p className="font-mono font-bold text-app1-text-main">{modalPenalty.violationLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded bg-app1-danger/10 px-2 py-0.5 font-poppins text-[10px] font-bold text-app1-danger">{modalPenalty.violationType}</span>
                      <span className="rounded bg-app1-bg-soft px-2 py-0.5 font-poppins text-[10px] font-bold uppercase text-app1-text-muted">{modalPenalty.userEmail}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-app1-border-light bg-app1-bg-soft p-6">
                  <h4 className="mb-2 font-poppins text-sm font-bold text-app1-text-main">Automated actions</h4>
                  <p className="font-poppins text-sm leading-relaxed text-app1-text-muted">
                    {modalPenalty.automatedPenalties?.length ? modalPenalty.automatedPenalties.join(', ') : 'None recorded'}
                  </p>
                  <p className="mt-3 font-poppins text-sm text-app1-text-muted">Score deduction: {modalPenalty.scoreDeduction}</p>
                  {modalPenalty.resolutionNotes ? (
                    <p className="mt-2 font-poppins text-sm text-app1-text-muted">Notes: {modalPenalty.resolutionNotes}</p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-6 border-t border-app1-border-light pt-6">
                  <div>
                    <p className="mb-1 font-poppins text-[10px] font-bold uppercase text-app1-text-muted">Ban applied</p>
                    <p className="font-poppins font-bold text-app1-text-main">{modalPenalty.banApplied ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="mb-1 font-poppins text-[10px] font-bold uppercase text-app1-text-muted">Created</p>
                    <p className="font-poppins font-bold text-app1-text-main">{new Date(modalPenalty.createdAt).toLocaleString()}</p>
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
                      className="w-full rounded-xl bg-app1-danger py-3 font-poppins text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                    >
                      Mark resolved
                    </button>
                  ) : (
                    <p className="text-center font-poppins text-sm text-app1-text-muted">This penalty is already resolved.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalPenalty(null)}
                    className="w-full font-poppins text-sm font-semibold text-app1-danger hover:underline"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="border-t border-app1-border-light bg-app1-bg-soft px-8 py-4">
                <p className="text-center font-poppins text-[10px] italic text-app1-text-muted">Deal: {modalPenalty.dealId ?? '—'} · Listing: {modalPenalty.listingId ?? '—'}</p>
              </div>
            </div>
          </div>
        ) : null}
      </>
    </DashboardLayout>
  )
}
