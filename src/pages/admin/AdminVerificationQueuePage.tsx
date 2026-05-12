import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  HelpCircle,
  History,
  Hourglass,
  IdCard,
  Info,
  Landmark,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
  Grid3x3,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'

const ADMIN_FOOTER_AVATAR = DEFAULT_AVATAR_IMAGE

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

const ROWS: QueueRow[] = [
  {
    id: 'sarah',
    name: 'Sarah Johnson',
    avatar: DEFAULT_AVATAR_IMAGE,
    role: 'Wholesaler',
    type: 'KYC ID',
    submitted: 'Submitted 3h ago',
    flagPill: {
      className: 'bg-amber-100 text-amber-800',
      icon: 'warn',
      text: 'Face match confidence: 72%',
    },
    tags: ['all', 'kyc'],
    panel: {
      subtitle: 'Sarah Johnson — ID verification',
      docFile: 'Primary ID: CA_LICENSE_9022.PDF',
      barLabel: 'Face match confidence',
      barPercent: 72,
      barClass: 'bg-amber-500',
      barTrackNote:
        'Selfie comparison vs government ID shows minor discrepancies in facial geometry.',
      checklist: [
        { kind: 'ok', text: 'Document expiry date: Valid' },
        { kind: 'ok', text: 'Database sanction check: Clear' },
        { kind: 'warn', text: 'Manual visual check required' },
      ],
    },
  },
  {
    id: 'david',
    name: 'David Chen',
    avatar: DEFAULT_AVATAR_IMAGE,
    role: 'Realtor',
    type: 'License check',
    submitted: 'Submitted 1d ago',
    flagPill: {
      className: 'bg-red-100 text-red-800',
      icon: 'error',
      text: 'License number not found in state DB',
    },
    tags: ['all', 'license'],
    panel: {
      subtitle: 'David Chen — License verification',
      docFile: 'Primary: DRE_LICENSE_SCAN.PDF',
      barLabel: 'State registry match',
      barPercent: 0,
      barClass: 'bg-red-500',
      barTrackNote: 'No matching active license record returned for the submitted credential number.',
      checklist: [
        { kind: 'warn', text: 'License number: Not found in state database' },
        { kind: 'ok', text: 'Document image quality: Acceptable' },
        { kind: 'warn', text: 'Manual verification with state board recommended' },
      ],
    },
  },
  {
    id: 'maria',
    name: 'Maria Santos',
    avatar: DEFAULT_AVATAR_IMAGE,
    role: 'Buyer',
    type: 'Bank link',
    submitted: 'Submitted 2d ago',
    flagPill: {
      className: 'bg-orange-100 text-orange-800',
      icon: 'history',
      text: 'Plaid: Insufficient account history',
    },
    tags: ['all', 'bank'],
    panel: {
      subtitle: 'Maria Santos — Bank link (Plaid)',
      docFile: 'Linked account: PLAID_ITEM_4412.JSON',
      barLabel: 'Account history depth',
      barPercent: 38,
      barClass: 'bg-orange-500',
      barTrackNote: 'Plaid reports fewer than 90 days of transaction history on the linked checking account.',
      checklist: [
        { kind: 'warn', text: 'Plaid: Insufficient account history' },
        { kind: 'ok', text: 'Identity match on account holder: Pass' },
        { kind: 'warn', text: 'Request secondary bank statement upload' },
      ],
    },
  },
]

const FILTER_OPTIONS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'kyc', label: 'KYC flagged' },
  { id: 'bank', label: 'Bank link issues' },
  { id: 'license', label: 'License check' },
  { id: 'approved', label: 'Approved' },
]

function FlagPillIcon({ kind }: { kind: QueueRow['flagPill']['icon'] }) {
  const cls = 'h-3.5 w-3.5 shrink-0'
  if (kind === 'warn') return <AlertTriangle className={cls} strokeWidth={2.5} aria-hidden />
  if (kind === 'error') return <CircleAlert className={cls} strokeWidth={2.5} aria-hidden />
  return <History className={cls} strokeWidth={2.5} aria-hidden />
}

export default function AdminVerificationQueuePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const [filter, setFilter] = useState<FilterTab>('all')
  const [selectedId, setSelectedId] = useState(ROWS[0]?.id ?? 'sarah')
  const [notes, setNotes] = useState('')

  const filtered = useMemo(() => {
    if (filter === 'approved') return []
    if (filter === 'all') return ROWS
    return ROWS.filter((r) => r.tags.includes(filter))
  }, [filter])

  useEffect(() => {
    if (filtered.length === 0) return
    if (!filtered.some((r) => r.id === selectedId)) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const selected = useMemo(() => ROWS.find((r) => r.id === selectedId) ?? ROWS[0], [selectedId])

  const displayName = user?.fullName?.trim() || 'System overseer'
  const adminIdLabel = user?.id ? `ADMIN_ID: ${user.id.slice(0, 8).toUpperCase()}` : 'ADMIN_ID: 9021'

  const onSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navInactive =
    'flex items-center gap-3 rounded p-3 font-inter text-xs font-bold uppercase tracking-wide text-gray-400 transition-colors hover:bg-[#272A2E] hover:text-gray-100'

  return (
    <div className="min-h-screen overflow-hidden bg-[#0B0E11] font-inter">
      <aside className="admin-penalty-scroll fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col overflow-y-auto border-r border-[#4d4635] bg-[#0B0E11] py-8 pl-4 pr-3 md:flex">
        <div className="mb-10 px-2">
          <h1 className="font-playfair text-xl font-bold text-tract-gold">TRACT App 2</h1>
          <p className="mt-1 font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af]/80">Super admin console</p>
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
          <Link
            to="/admin/verification-queue"
            className="flex items-center gap-3 rounded border-r-2 border-tract-gold bg-[#191c1f] p-3 font-inter text-xs font-bold uppercase tracking-wide text-tract-gold"
          >
            <BadgeCheck className="h-5 w-5 shrink-0 text-tract-gold" strokeWidth={1.75} aria-hidden />
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
          <Link to="/admin/financial-ledger" className={navInactive}>
            <Landmark className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Financial ledger
          </Link>
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('State firewall coming soon.')}>
            <Grid3x3 className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
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
          <div className="mt-2 flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#4d4635] bg-[#323538]">
              <img src={ADMIN_FOOTER_AVATAR} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-gray-200">{adminIdLabel}</p>
              <p className="truncate font-inter text-xs text-gray-500">{displayName}</p>
            </div>
          </div>
          <button type="button" onClick={onSignOut} className={cn('mb-2 w-full text-left', navInactive)}>
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <main className="relative flex min-h-screen md:ml-72">
        <div className="min-h-0 flex-1 overflow-y-auto bg-tract-alabaster p-6 md:p-12">
          <header className="mb-10">
            <h2 className="font-playfair text-[28px] font-bold text-tract-obsidian">Verification queue</h2>
            <p className="mt-2 max-w-2xl font-inter text-base text-gray-500">
              Users flagged by the automated KYC/Plaid system for manual review.
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
                  filter === f.id
                    ? 'bg-tract-obsidian text-white'
                    : 'border border-[#4d4635] text-tract-obsidian hover:bg-[#191c1f]/10',
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
                        No queue items in this view.
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
                                {row.id === 'sarah' ? 'Review documents' : 'Review'}
                              </button>
                              <button
                                type="button"
                                title="Approve"
                                className="rounded p-2 text-green-600 transition-colors hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.success(`Approval queued for ${row.name} (demo).`)
                                }}
                              >
                                <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                              </button>
                              <button
                                type="button"
                                title="Reject"
                                className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.message(`Rejection draft for ${row.name} (demo).`)
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
              <p className="mt-2 font-inter text-sm text-gray-500">No items in this demo view. Archived approvals will appear here.</p>
            </div>
          ) : (
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
              <div
                className={cn('h-full rounded-full', selected.panel.barClass)}
                style={{ width: `${Math.min(100, selected.panel.barPercent)}%` }}
              />
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
              onClick={() => toast.success(`Verification approved for ${selected.name} (demo).`)}
              className="w-full rounded py-3 font-inter text-sm font-semibold text-[#3c2f00] shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: '#f2ca50' }}
            >
              Approve verification
            </button>
            <button
              type="button"
              onClick={() => toast.message('Rejection workflow coming soon.')}
              className="w-full rounded border border-red-600 py-3 font-inter text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Reject application
            </button>
          </div>
            </>
          )}
        </aside>

        <div className="border-t border-[#4d4635]/30 bg-white p-4 lg:hidden">
          <p className="text-center font-inter text-sm text-gray-500">Open on a larger screen for the document review panel.</p>
        </div>
      </main>
    </div>
  )
}
