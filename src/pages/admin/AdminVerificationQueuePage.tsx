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
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'
import { useVerificationQueue, useReviewKyc } from '@/hooks/useAdmin'
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
    flagClass = 'bg-red-100 text-red-800'
    flagText = 'License verification needed'
  } else if (needsBank) {
    flagIcon = 'history'
    flagClass = 'bg-orange-100 text-orange-800'
    flagText = 'Bank link incomplete'
  }

  const type =
    licenseGap ? 'License check' : needsBank ? 'Bank link' : kycOpen ? 'KYC ID' : 'Verification'

  const barPercent = licenseGap ? 15 : needsBank ? 40 : kycOpen ? 55 : 80
  const barClass = licenseGap ? 'bg-red-500' : needsBank ? 'bg-orange-500' : 'bg-amber-500'

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

export default function AdminVerificationQueuePage() {
  const { data: apiUsers = [], isLoading, isError, refetch } = useVerificationQueue()
  const reviewKyc = useReviewKyc()

  const rows = useMemo(() => apiUsers.map(mapUserToRow), [apiUsers])

  const [filter, setFilter] = useState<FilterTab>('all')
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
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter">
        <main className="flex min-h-screen items-center justify-center px-4">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="font-inter text-gray-500">Failed to load verification queue.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 font-inter text-sm font-bold uppercase text-tract-gold hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter">
      <main className="min-h-screen px-4 py-8 md:p-10">
        <div className="relative flex min-h-screen min-w-0">
          <div className="min-h-0 flex-1 overflow-y-auto bg-tract-alabaster p-6 md:p-12">
            <header className="mb-10">
              <h2 className="font-playfair text-[28px] font-bold text-tract-obsidian">Verification queue</h2>
              <p className="mt-2 max-w-2xl font-inter text-base text-gray-500">
                Users with KYC pending or in progress. Approve or reject from the table or the review panel.
              </p>
            </header>

            <div className="mb-6 flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'rounded-lg px-5 py-2 font-inter text-sm font-semibold transition-all',
                    filter === f.id ? 'bg-tract-obsidian text-white' : 'border border-[#4d4635] text-tract-obsidian hover:bg-[#191c1f]/10',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#4d4635]/40 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#4d4635]/30 bg-black/[0.03]">
                      {['User', 'Role', 'Type', 'Submitted', 'Flag reason', 'Action'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-4 font-inter text-xs font-bold uppercase tracking-wide text-tract-obsidian',
                            h === 'Action' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#4d4635]/20">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center font-inter text-sm text-gray-500">
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
                              'cursor-pointer transition-colors hover:bg-black/[0.02]',
                              isSelected && 'bg-black/[0.04] ring-1 ring-inset ring-tract-gold/25',
                            )}
                          >
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#323538]">
                                  <img src={row.avatar} alt="" className="h-full w-full object-cover" />
                                </div>
                                <span className="font-inter text-base font-semibold text-tract-obsidian">{row.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-6 font-inter text-sm text-gray-500">{row.role}</td>
                            <td className="px-6 py-6 font-inter text-sm text-gray-500">{row.type}</td>
                            <td className="px-6 py-6 font-inter text-sm text-gray-500">{row.submitted}</td>
                            <td className="px-6 py-6">
                              <span
                                className={cn(
                                  'inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 font-inter text-[11px] font-bold uppercase tracking-wider',
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
                                  className="font-inter text-xs font-semibold text-tract-gold hover:underline"
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
                                  className="rounded p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
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
                                  className="rounded p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
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

          <aside className="hidden w-[400px] shrink-0 overflow-y-auto border-l border-[#4d4635]/40 bg-white p-6 lg:block lg:sticky lg:top-0 lg:h-screen">
            {filter === 'approved' ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BadgeCheck className="mb-4 h-12 w-12 text-tract-gold" strokeWidth={1.25} aria-hidden />
                <h3 className="font-playfair text-xl font-bold text-tract-obsidian">Approved</h3>
                <p className="mt-2 font-inter text-sm text-gray-500">Approved users leave this queue. Use filters to find open cases.</p>
              </div>
            ) : selected ? (
              <>
                <div className="mb-6">
                  <h3 className="font-playfair text-xl font-bold text-tract-obsidian">Document review</h3>
                  <p className="mt-1 font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500">{selected.panel.subtitle}</p>
                </div>

                <div className="group relative mb-6 flex aspect-[1.6/1] w-full cursor-zoom-in flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#99907c]/60 bg-[#191c1f]">
                  <div className="pointer-events-none absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20">
                    <img src={DOC_PATTERN} alt="" className="h-full w-full object-cover" />
                  </div>
                  <IdCard className="relative z-[1] mb-2 h-12 w-12 text-[#99907c]" strokeWidth={1.25} aria-hidden />
                  <span className="relative z-[1] px-4 text-center font-inter text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    {selected.panel.docFile}
                  </span>
                  <button
                    type="button"
                    onClick={() => toast.message('Fullscreen document viewer coming soon.')}
                    className="relative z-[1] mt-4 rounded border border-[#4d4635] bg-white px-4 py-2 font-inter text-xs font-semibold text-tract-obsidian shadow-sm hover:bg-gray-50"
                  >
                    View fullscreen
                  </button>
                </div>

                <div className="mb-6">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-inter text-[11px] font-bold uppercase text-tract-obsidian">{selected.panel.barLabel}</span>
                    <span
                      className={cn(
                        'font-mono text-sm font-semibold',
                        selected.panel.barPercent === 0 && 'text-red-600',
                        selected.panel.barPercent > 0 && selected.panel.barPercent < 50 && 'text-orange-600',
                        selected.panel.barPercent >= 50 && 'text-amber-600',
                      )}
                    >
                      {selected.panel.barPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#191c1f]/30">
                    <div className={cn('h-full rounded-full', selected.panel.barClass)} style={{ width: `${Math.min(100, selected.panel.barPercent)}%` }} />
                  </div>
                  <p className="mt-2 font-inter text-xs text-gray-500">{selected.panel.barTrackNote}</p>
                </div>

                <div className="mb-6 space-y-2">
                  {selected.panel.checklist.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center gap-2 rounded p-2',
                        item.kind === 'ok' && 'bg-[#191c1f]/5',
                        item.kind === 'warn' && 'bg-amber-50',
                      )}
                    >
                      {item.kind === 'ok' ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" strokeWidth={2} aria-hidden />
                      ) : (
                        <Info className="h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} aria-hidden />
                      )}
                      <span className="font-inter text-[13px] text-tract-obsidian">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6 flex-1">
                  <label htmlFor="admin-vq-notes" className="mb-1 block font-inter text-[11px] font-bold uppercase text-tract-obsidian">
                    Admin notes
                  </label>
                  <textarea
                    id="admin-vq-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter findings from manual document review..."
                    rows={5}
                    className="w-full resize-none border-0 border-b border-[#4d4635]/40 bg-[#191c1f]/10 p-4 font-inter text-sm text-tract-obsidian placeholder:text-gray-400 focus:border-tract-gold focus:outline-none focus:ring-0"
                  />
                </div>

                <div className="space-y-2 border-t border-[#4d4635]/30 pt-6">
                  <button
                    type="button"
                    disabled={reviewKyc.isPending}
                    onClick={() => reviewKyc.mutate({ userId: selected.id, action: 'approve' })}
                    className="w-full rounded py-3 font-inter text-sm font-semibold text-[#3c2f00] shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#f2ca50' }}
                  >
                    Approve verification
                  </button>
                  <button
                    type="button"
                    disabled={reviewKyc.isPending}
                    onClick={() => reviewKyc.mutate({ userId: selected.id, action: 'reject' })}
                    className="w-full rounded border border-red-600 py-3 font-inter text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject application
                  </button>
                </div>
              </>
            ) : (
              <p className="py-12 text-center font-inter text-sm text-gray-500">Select a user from the table.</p>
            )}
          </aside>

          <div className="border-t border-[#4d4635]/30 bg-white p-4 lg:hidden">
            <p className="text-center font-inter text-sm text-gray-500">Open on a larger screen for the document review panel.</p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
