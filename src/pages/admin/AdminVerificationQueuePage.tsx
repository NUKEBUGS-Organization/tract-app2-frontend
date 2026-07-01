import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  History,
  IdCard,
  Info,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/app1/PageHeader'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'
import { useVerificationQueue, useReviewKyc } from '@/hooks/useAdmin'
import { useApprovePof, useRejectPof } from '@/hooks/usePof'
import type { PendingUser } from '@/hooks/useAdmin'

const DOC_PATTERN = DEFAULT_PROPERTY_IMAGE

type FilterTab = 'all' | 'kyc' | 'bank' | 'license' | 'approved'

type ChecklistEntry = { kind: 'ok' | 'warn'; text: string }

type QueueRow = {
  id: string
  name: string
  avatar: string
  role: string
  type: string
  submitted: string
  flagPill: { className: string; icon: 'warn' | 'error' | 'history'; text: string }
  tags: FilterTab[]
  panel: {
    subtitle: string
    docFile: string
    barLabel: string
    barPercent: number
    barClass: string
    barTrackNote: string
    checklist: ChecklistEntry[]
  }
}

const FILTER_OPTIONS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'kyc', label: 'KYC flagged' },
  { id: 'bank', label: 'Bank link issues' },
  { id: 'license', label: 'License check' },
  { id: 'approved', label: 'Approved' },
]

function roleLabel(role: string): string {
  const m: Record<string, string> = {
    wholesaler: 'Wholesaler',
    buyer: 'Buyer',
    realtor: 'Realtor',
    admin: 'Admin',
    title_rep: 'Title rep',
    seller: 'Seller',
  }
  return m[role] ?? role
}

function submittedFrom(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Submitted recently'
  const diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'Submitted just now'
  if (h < 24) return `Submitted ${h}h ago`
  const days = Math.floor(diff / 86_400_000)
  return `Submitted ${days}d ago`
}

function mapUserToRow(u: PendingUser): QueueRow {
  const needsBank = !u.bankVerified
  const kycOpen = u.kycStatus === 'pending' || u.kycStatus === 'in_progress'
  const licenseGap = u.role === 'realtor' && !(u.licenseNumber && u.licenseNumber.trim())

  const tags: FilterTab[] = ['all']
  if (kycOpen) tags.push('kyc')
  if (needsBank) tags.push('bank')
  if (licenseGap) tags.push('license')

  let flagIcon: QueueRow['flagPill']['icon'] = 'warn'
  let flagClass = 'bg-amber-100 text-amber-800'
  let flagText = 'KYC review required'
  if (licenseGap) {
    flagIcon = 'error'
    flagClass = 'bg-app1-danger/10 text-app1-danger'
    flagText = 'License verification needed'
  } else if (needsBank) {
    flagIcon = 'history'
    flagClass = 'bg-orange-100 text-orange-800'
    flagText = 'Bank link incomplete'
  }

  const type =
    licenseGap ? 'License check' : needsBank ? 'Bank link' : kycOpen ? 'KYC ID' : 'Verification'

  const barPercent = licenseGap ? 15 : needsBank ? 40 : kycOpen ? 55 : 80
  const barClass = licenseGap ? 'bg-app1-danger' : needsBank ? 'bg-orange-500' : 'bg-amber-500'

  const checklist: ChecklistEntry[] = [
    { kind: kycOpen ? 'warn' : 'ok', text: `KYC status: ${u.kycStatus}` },
    { kind: u.bankVerified ? 'ok' : 'warn', text: u.bankVerified ? 'Bank verified' : 'Bank not verified' },
    {
      kind: licenseGap ? 'warn' : 'ok',
      text: u.role === 'realtor' ? (u.licenseNumber ? `License on file: ${u.licenseNumber}` : 'License number missing') : 'License not required for role',
    },
  ]

  return {
    id: u.id,
    name: u.fullName,
    avatar: DEFAULT_AVATAR_IMAGE,
    role: roleLabel(u.role),
    type,
    submitted: submittedFrom(u.createdAt),
    flagPill: { className: flagClass, icon: flagIcon, text: flagText },
    tags,
    panel: {
      subtitle: `${u.fullName} — ${type}`,
      docFile: `User record: ${u.email}`,
      barLabel: 'Queue priority',
      barPercent,
      barClass,
      barTrackNote: `Phone ${u.phone} · ${u.stateCode || '—'} · Brokerage: ${u.brokerageName?.trim() || '—'}`,
      checklist,
    },
  }
}

function FlagPillIcon({ kind }: { kind: QueueRow['flagPill']['icon'] }) {
  const cls = 'h-3.5 w-3.5 shrink-0'
  if (kind === 'warn') return <AlertTriangle className={cls} strokeWidth={2.5} aria-hidden />
  if (kind === 'error') return <CircleAlert className={cls} strokeWidth={2.5} aria-hidden />
  return <History className={cls} strokeWidth={2.5} aria-hidden />
}

function PofQueueSection() {
  const approvePof = useApprovePof()
  const rejectPof = useRejectPof()

  const { data: users = [] } = useVerificationQueue()

  const pofPending = users.filter((u) => u.pofStatus === 'pending')

  if (pofPending.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <CheckCircle2 className="h-10 w-10 text-app1-primary" strokeWidth={1} />
        <p className="font-poppins text-[14px] text-app1-text-muted">No POF submissions pending review.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pofPending.map((user) => (
        <div key={user.id} className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-poppins text-[14px] font-bold text-app1-text-main">{user.fullName}</p>
              <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                {user.email} · {user.role}
              </p>
              {user.pofDocumentType ? (
                <span className="mt-2 inline-block rounded-full bg-app1-bg-soft px-3 py-1 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted">
                  {user.pofDocumentType.replace(/_/g, ' ')}
                </span>
              ) : null}
              {user.pofDocumentUrl ? (
                <a
                  href={user.pofDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block font-poppins text-[12px] text-app1-secondary hover:underline"
                >
                  View document →
                </a>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={approvePof.isPending}
                onClick={() => approvePof.mutate(user.id)}
                className="rounded bg-app1-primary px-4 py-2 font-poppins text-[12px] font-bold text-white hover:opacity-80 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={rejectPof.isPending}
                onClick={() => {
                  const r = window.prompt('Rejection reason:')
                  if (r) {
                    rejectPof.mutate({ userId: user.id, reason: r })
                  }
                }}
                className="rounded bg-app1-danger px-4 py-2 font-poppins text-[12px] font-bold text-white hover:opacity-80 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminVerificationQueuePage() {
  const { data: apiUsers = [], isLoading, isError, refetch } = useVerificationQueue()
  const reviewKyc = useReviewKyc()

  const rows = useMemo(() => apiUsers.map(mapUserToRow), [apiUsers])

  const [filter, setFilter] = useState<FilterTab>('all')
  const [activeTab, setActiveTab] = useState<'kyc' | 'pof'>('kyc')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (rows.length && !selectedId) setSelectedId(rows[0].id)
  }, [rows, selectedId])

  const filtered = useMemo(() => {
    if (filter === 'approved') return []
    if (filter === 'all') return rows
    return rows.filter((r) => r.tags.includes(filter))
  }, [filter, rows])

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((r) => r.id === selectedId)) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const selected = useMemo(() => {
    if (filter === 'approved') return undefined
    if (filtered.length === 0) return undefined
    const sid = selectedId && filtered.some((r) => r.id === selectedId) ? selectedId : filtered[0].id
    return filtered.find((r) => r.id === sid) ?? filtered[0]
  }, [filter, filtered, selectedId])

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins">
        <main className="flex min-h-screen items-center justify-center px-4">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="font-poppins text-app1-text-muted">Failed to load verification queue.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 font-poppins text-sm font-bold uppercase text-app1-secondary hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins">
      <main className="min-h-screen px-4 py-8 md:p-10">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <PageHeader
            eyebrow="Admin Workspace"
            title="Verification Queue"
            description="Users with KYC pending or in progress. Approve or reject from the table or the review panel."
          />

          <div className="flex gap-2">
            {(['kyc', 'pof'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-full px-5 py-2.5 font-poppins',
                  'text-[12px] font-bold uppercase',
                  'tracking-wider transition-colors',
                  'border',
                  activeTab === tab
                    ? 'bg-app1-secondary border-app1-secondary text-app1-primary-dark'
                    : 'border-app1-border-light bg-app1-bg-soft text-app1-text-muted hover:border-app1-secondary hover:text-app1-text-main',
                )}
              >
                {tab === 'kyc' ? 'KYC Verification' : 'Proof of Funds'}
              </button>
            ))}
          </div>

          {activeTab === 'pof' ? (
            <PofQueueSection />
          ) : (
          <div className="relative flex min-h-screen min-w-0">
            <div className="min-h-0 flex-1 overflow-y-auto pt-0">
              {activeTab === 'kyc' && (
              <div className="mb-6 flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      'rounded-full px-5 py-2 font-poppins text-sm font-semibold transition-all border',
                      filter === f.id ? 'bg-app1-secondary text-app1-primary-dark border-app1-secondary' : 'border-app1-border-light text-app1-text-main hover:bg-app1-bg-soft',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              )}

              <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                        {['User', 'Role', 'Type', 'Submitted', 'Flag reason', 'Action'].map((h) => (
                          <th
                            key={h}
                            className={cn(
                              'px-6 py-4 font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-muted',
                              h === 'Action' && 'text-right',
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app1-border-light">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center font-poppins text-sm text-app1-text-muted">
                            {rows.length === 0 ? 'No users pending verification.' : 'No queue items in this view.'}
                          </td>
                        </tr>
                      ) : (
                        filtered.map((row) => {
                          const isSelected = row.id === selectedId
                          return (
                            <tr
                              key={row.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setSelectedId(row.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  setSelectedId(row.id)
                                }
                              }}
                              className={cn(
                                'cursor-pointer transition-colors hover:bg-app1-bg-soft/60',
                                isSelected && 'bg-app1-bg-soft ring-1 ring-inset ring-app1-secondary/25',
                              )}
                            >
                              <td className="px-6 py-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-app1-bg-soft">
                                    <img src={row.avatar} alt="" className="h-full w-full object-cover" />
                                  </div>
                                  <span className="font-poppins text-base font-semibold text-app1-text-main">{row.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-6 font-poppins text-sm text-app1-text-muted">{row.role}</td>
                              <td className="px-6 py-6 font-poppins text-sm text-app1-text-muted">{row.type}</td>
                              <td className="px-6 py-6 font-poppins text-sm text-app1-text-muted">{row.submitted}</td>
                              <td className="px-6 py-6">
                                <span
                                  className={cn(
                                    'inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 font-poppins text-[11px] font-bold uppercase tracking-wider',
                                    row.flagPill.className,
                                  )}
                                >
                                  <FlagPillIcon kind={row.flagPill.icon} />
                                  {row.flagPill.text}
                                </span>
                              </td>
                              <td className="px-6 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    className="font-poppins text-xs font-semibold text-app1-secondary hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedId(row.id)
                                    }}
                                  >
                                    Review
                                  </button>
                                  <button
                                    type="button"
                                    title="Approve"
                                    className="rounded bg-app1-primary p-2 text-white transition-colors hover:opacity-85 disabled:opacity-50"
                                    disabled={reviewKyc.isPending}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      reviewKyc.mutate({ userId: row.id, action: 'approve' })
                                    }}
                                  >
                                    <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    title="Reject"
                                    className="rounded bg-app1-danger p-2 text-white transition-colors hover:opacity-85 disabled:opacity-50"
                                    disabled={reviewKyc.isPending}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      reviewKyc.mutate({ userId: row.id, action: 'reject' })
                                    }}
                                  >
                                    <XCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside className="hidden w-[400px] shrink-0 overflow-y-auto border-l border-app1-border-light bg-app1-bg-card p-6 lg:block lg:sticky lg:top-0 lg:h-screen">
              {filter === 'approved' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BadgeCheck className="mb-4 h-12 w-12 text-app1-secondary" strokeWidth={1.25} aria-hidden />
                  <h3 className="font-cinzel text-xl font-bold text-app1-text-main">Approved</h3>
                  <p className="mt-2 font-poppins text-sm text-app1-text-muted">Approved users leave this queue. Use filters to find open cases.</p>
                </div>
              ) : selected ? (
                <>
                  <div className="mb-6">
                    <h3 className="font-cinzel text-xl font-bold text-app1-text-main">Document review</h3>
                    <p className="mt-1 font-poppins text-[11px] font-bold uppercase tracking-wide text-app1-text-muted">{selected.panel.subtitle}</p>
                  </div>

                  <div className="group relative mb-6 flex aspect-[1.6/1] w-full cursor-zoom-in flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-app1-border-light bg-app1-bg-soft">
                    <div className="pointer-events-none absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20">
                      <img src={DOC_PATTERN} alt="" className="h-full w-full object-cover" />
                    </div>
                    <IdCard className="relative z-[1] mb-2 h-12 w-12 text-app1-text-muted" strokeWidth={1.25} aria-hidden />
                    <span className="relative z-[1] px-4 text-center font-poppins text-[11px] font-bold uppercase tracking-wide text-app1-text-muted">
                      {selected.panel.docFile}
                    </span>
                    <button
                      type="button"
                      onClick={() => toast.message('Fullscreen document viewer coming soon.')}
                      className="relative z-[1] mt-4 rounded border border-app1-border-light bg-app1-bg-card px-4 py-2 font-poppins text-xs font-semibold text-app1-text-main shadow-app1-card hover:bg-app1-bg-soft"
                    >
                      View fullscreen
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-poppins text-[11px] font-bold uppercase text-app1-text-main">{selected.panel.barLabel}</span>
                      <span
                        className={cn(
                          'font-mono text-sm font-semibold',
                          selected.panel.barPercent === 0 && 'text-app1-danger',
                          selected.panel.barPercent > 0 && selected.panel.barPercent < 50 && 'text-orange-600',
                          selected.panel.barPercent >= 50 && 'text-amber-600',
                        )}
                      >
                        {selected.panel.barPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-app1-bg-soft">
                      <div className={cn('h-full rounded-full', selected.panel.barClass)} style={{ width: `${Math.min(100, selected.panel.barPercent)}%` }} />
                    </div>
                    <p className="mt-2 font-poppins text-xs text-app1-text-muted">{selected.panel.barTrackNote}</p>
                  </div>

                  <div className="mb-6 space-y-2">
                    {selected.panel.checklist.map((item, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center gap-2 rounded p-2',
                          item.kind === 'ok' && 'bg-app1-bg-soft',
                          item.kind === 'warn' && 'bg-amber-50',
                        )}
                      >
                        {item.kind === 'ok' ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-app1-primary" strokeWidth={2} aria-hidden />
                        ) : (
                          <Info className="h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} aria-hidden />
                        )}
                        <span className="font-poppins text-[13px] text-app1-text-main">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 flex-1">
                    <label htmlFor="admin-vq-notes" className="mb-1 block font-poppins text-[11px] font-bold uppercase text-app1-text-main">
                      Admin notes
                    </label>
                    <textarea
                      id="admin-vq-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter findings from manual document review..."
                      rows={5}
                      className="w-full resize-none rounded-xl border border-app1-border-light bg-app1-bg-soft p-4 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-1 focus:ring-app1-secondary"
                    />
                  </div>

                  <div className="space-y-2 border-t border-app1-border-light pt-6">
                    <button
                      type="button"
                      disabled={reviewKyc.isPending}
                      onClick={() => reviewKyc.mutate({ userId: selected.id, action: 'approve' })}
                      className="w-full rounded-xl bg-app1-primary py-3 font-poppins text-sm font-semibold text-white shadow-app1-card transition-all hover:opacity-90 disabled:opacity-50"
                    >
                      Approve verification
                    </button>
                    <button
                      type="button"
                      disabled={reviewKyc.isPending}
                      onClick={() => reviewKyc.mutate({ userId: selected.id, action: 'reject' })}
                      className="w-full rounded-xl bg-app1-danger py-3 font-poppins text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                    >
                      Reject application
                    </button>
                  </div>
                </>
              ) : (
                <p className="py-12 text-center font-poppins text-sm text-app1-text-muted">Select a user from the table.</p>
              )}
            </aside>

            <div className="border-t border-app1-border-light bg-app1-bg-card p-4 lg:hidden">
              <p className="text-center font-poppins text-sm text-app1-text-muted">Open on a larger screen for the document review panel.</p>
            </div>
          </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  )
}
