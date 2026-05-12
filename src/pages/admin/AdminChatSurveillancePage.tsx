import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  HelpCircle,
  History,
  Hourglass,
  Landmark,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  UserCircle,
  Users,
  Grid3x3,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'

const ADMIN_AVATAR = DEFAULT_AVATAR_IMAGE

const RED = '#C0392B'
const BURGUNDY = '#733641'

type ChatBubble = {
  id: string
  align: 'left' | 'right'
  meta: string
  body: ReactNode
  flagged?: boolean
}

type FlaggedRow = {
  id: string
  deal: string
  sender: string
  preview: string
  flagLabel: string
  flagPillClass: string
  flagPillStyle?: CSSProperties
  time: string
  borderLeftColor?: string
  resolved: boolean
  context: { dealLabel: string; messages: ChatBubble[] }
}

const FLAGGED_ROWS: FlaggedRow[] = [
  {
    id: 'a047',
    deal: '#Deal-A047',
    sender: 'Marcus T.',
    preview: '"Call me at 555-867-..."',
    flagLabel: 'Phone number',
    flagPillClass: 'bg-[#93000a] text-white',
    time: '2h ago',
    borderLeftColor: RED,
    resolved: false,
    context: {
      dealLabel: '#Deal-A047',
      messages: [
        {
          id: '1',
          align: 'left',
          meta: 'Marcus T. • 2:14 PM',
          body: "Jordan, I've reviewed the documents for the mid-town property. Everything looks solid.",
        },
        {
          id: '2',
          align: 'right',
          meta: 'Jordan M. • 2:15 PM',
          body: 'Great. Do you want to discuss the earnest money deposit now or tomorrow?',
        },
        {
          id: '3',
          align: 'left',
          meta: 'Marcus T. • 2:16 PM (FLAGGED)',
          flagged: true,
          body: (
            <>
              Hey Jordan, let&apos;s take this offline. Call me at{' '}
              <span className="rounded-full bg-[#C0392B] px-2 py-0.5 font-bold text-white">555-867-5309</span> to discuss
              the EMD.
            </>
          ),
        },
      ],
    },
  },
  {
    id: 'b082',
    deal: '#Deal-B082',
    sender: 'Jordan M.',
    preview: '"My email is jordan@..."',
    flagLabel: 'Email address',
    flagPillClass: 'bg-[#93000a] text-white',
    time: '5h ago',
    borderLeftColor: RED,
    resolved: false,
    context: {
      dealLabel: '#Deal-B082',
      messages: [
        {
          id: '1',
          align: 'left',
          meta: 'Seller rep • 9:02 AM',
          body: 'Jordan, please confirm you received the disclosure packet.',
        },
        {
          id: '2',
          align: 'right',
          meta: 'Jordan M. • 9:04 AM (FLAGGED)',
          flagged: true,
          body: (
            <>
              Yes — also my email is <span className="rounded-full bg-[#C0392B] px-2 py-0.5 font-bold text-white">jordan@personal.com</span> if you need anything off-platform.
            </>
          ),
        },
      ],
    },
  },
  {
    id: 'c019',
    deal: '#Deal-C019',
    sender: 'Taylor R.',
    preview: '"Check this link: bit.ly/..."',
    flagLabel: 'External link',
    flagPillClass: 'text-white',
    flagPillStyle: { backgroundColor: BURGUNDY },
    time: '1d ago',
    borderLeftColor: BURGUNDY,
    resolved: true,
    context: {
      dealLabel: '#Deal-C019',
      messages: [
        {
          id: '1',
          align: 'left',
          meta: 'Taylor R. • Yesterday (FLAGGED)',
          flagged: true,
          body: (
            <>
              Check this link: <span className="font-mono font-bold text-[#733641]">bit.ly/tract-offer</span> for my comps sheet.
            </>
          ),
        },
        {
          id: '2',
          align: 'right',
          meta: 'System • Auto-reply',
          body: 'External URL sharing is restricted. Message logged for compliance.',
        },
      ],
    },
  },
]

function rowBorderStyle(row: FlaggedRow): CSSProperties | undefined {
  if (row.borderLeftColor) return { borderLeftColor: row.borderLeftColor }
  return undefined
}

export default function AdminChatSurveillancePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const rows = FLAGGED_ROWS
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? 'a047')

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? rows[0], [rows, selectedId])

  const displayName = user?.fullName?.trim() || 'Alex Mercer'

  const onSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navInactive =
    'flex cursor-pointer items-center gap-3 rounded p-2 font-inter text-xs font-bold uppercase tracking-wide text-gray-400 transition-colors hover:bg-[#272A2E] hover:text-gray-100'

  return (
    <div className="min-h-screen bg-tract-alabaster font-inter text-gray-800">
      <aside className="admin-penalty-scroll fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col overflow-y-auto border-r border-[#4d4635] bg-[#0B0E11] py-8 pl-4 pr-3 md:flex">
        <div className="mb-10 px-2">
          <h1 className="font-playfair text-xl font-bold text-tract-gold">TRACT App 2</h1>
          <p className="mt-1 font-inter text-xs font-bold uppercase tracking-wider text-[#d0c5af]/80">Super admin console</p>
        </div>
        <nav className="flex-1 space-y-1">
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
          <Link
            to="/admin/chat-surveillance"
            className="flex cursor-pointer items-center gap-3 rounded-l border-r-2 border-tract-gold bg-[#272A2E] p-2 font-inter text-xs font-bold uppercase tracking-wide text-tract-gold"
          >
            <Shield className="h-5 w-5 shrink-0 text-tract-gold" strokeWidth={1.75} aria-hidden />
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
        <div className="mt-auto space-y-1 border-t border-[#4d4635] pt-8">
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('Admin settings coming soon.')}>
            <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Settings
          </button>
          <button type="button" className={cn('w-full text-left', navInactive)} onClick={() => toast.message('Support portal coming soon.')}>
            <HelpCircle className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Support
          </button>
          <div className="mt-4 flex items-center gap-3 p-2">
            <img src={ADMIN_AVATAR} alt="" className="h-10 w-10 rounded-full border-2 border-tract-gold object-cover" />
            <div>
              <p className="font-inter text-sm font-semibold text-gray-200">{displayName}</p>
              <p className="font-inter text-[10px] font-bold uppercase tracking-widest text-gray-500">Master admin</p>
            </div>
          </div>
          <button type="button" onClick={onSignOut} className={cn('mb-2 w-full text-left', navInactive)}>
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-[#4d4635] bg-[#111417] px-4 py-3 pl-4 md:pl-[288px] md:pr-8">
        <h2 className="font-playfair text-xl font-bold text-gray-100">Chat surveillance</h2>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" strokeWidth={2} aria-hidden />
            <input
              type="search"
              placeholder="Search conversations..."
              className="w-52 rounded-full border-0 bg-[#1d2023] py-2 pl-10 pr-4 font-inter text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-tract-gold md:w-64"
              onChange={() => toast.message('Search indexing coming soon.')}
            />
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <button type="button" className="hover:text-tract-gold" aria-label="Notifications">
              <Bell className="h-6 w-6" strokeWidth={1.75} />
            </button>
            <button type="button" className="hover:text-tract-gold" aria-label="History" onClick={() => toast.message('Audit history coming soon.')}>
              <History className="h-6 w-6" strokeWidth={1.75} />
            </button>
            <button type="button" className="hover:text-tract-gold" aria-label="Account">
              <UserCircle className="h-6 w-6" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-6 px-4 py-8 md:ml-72 md:px-12">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="font-playfair text-[28px] font-bold text-tract-obsidian">Chat surveillance</h2>
          <p className="mt-2 max-w-3xl font-inter text-base text-gray-500">
            Automated monitoring of all in-app communications for anti-circumvention violations.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: 'Flagged today', value: '3', color: '#C0392B' },
            { label: 'Auto-blocked', value: '12', color: '#F4A2AD' },
            { label: 'Under review', value: '1', color: '#D4AF37' },
          ].map((s) => (
            <div
              key={s.label}
              className="flex h-32 flex-col justify-between rounded-xl border border-black/10 bg-white p-6 transition-transform hover:scale-[1.02] hover:border-tract-gold/60"
            >
              <span className="font-inter text-xs font-bold uppercase tracking-wide text-gray-500">{s.label}</span>
              <span className="font-playfair text-5xl font-bold leading-none" style={{ color: s.color }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-playfair text-xl font-bold text-tract-obsidian">Flagged messages</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toast.message('Filters coming soon.')}
                  className="rounded bg-[#1d2023] px-4 py-2 font-inter text-xs font-bold uppercase tracking-wide text-gray-200"
                >
                  Filter
                </button>
                <button
                  type="button"
                  onClick={() => toast.message('Export queued (CSV).')}
                  className="rounded bg-[#1d2023] px-4 py-2 font-inter text-xs font-bold uppercase tracking-wide text-gray-200"
                >
                  Export
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-black/10">
                    {['Deal', 'Sender', 'Message preview', 'Flag type', 'Time', 'Action'].map((h) => (
                      <th key={h} className="py-4 font-inter text-xs font-bold uppercase tracking-wide text-gray-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-inter text-sm text-tract-obsidian">
                  {rows.map((row) => {
                    const pillStyle = row.flagPillStyle
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          'group cursor-pointer border-b border-black/10 transition-colors hover:bg-tract-alabaster',
                          selectedId === row.id && 'bg-tract-alabaster/80',
                        )}
                        onClick={() => setSelectedId(row.id)}
                      >
                        <td
                          className="border-l-4 border-transparent py-4 pl-3 font-medium"
                          style={rowBorderStyle(row)}
                        >
                          {row.deal}
                        </td>
                        <td className="py-4 font-semibold">{row.sender}</td>
                        <td className="py-4 italic text-gray-500">{row.preview}</td>
                        <td className="py-4">
                          <span
                            className={cn(
                              'inline-block rounded-full px-2 py-1 font-inter text-[10px] font-bold uppercase tracking-tighter',
                              row.flagPillClass,
                            )}
                            style={pillStyle}
                          >
                            {row.flagLabel}
                          </span>
                        </td>
                        <td className="py-4 text-gray-500">{row.time}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              className="font-inter text-sm font-semibold text-tract-gold hover:underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedId(row.id)
                              }}
                            >
                              View full
                            </button>
                            {!row.resolved ? (
                              <button
                                type="button"
                                className="rounded border border-[#C0392B] px-2 py-1 font-inter text-sm font-semibold text-[#C0392B] transition-colors hover:bg-[#C0392B] hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.message(`Warning draft queued for ${row.sender}`)
                                }}
                              >
                                Warn user
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-inter text-sm font-semibold text-[#2D5016]">
                                Resolved <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="w-full shrink-0 lg:w-[400px]">
            <div className="sticky top-24 flex flex-col rounded-xl border border-black/10 bg-white p-6 shadow-lg">
              <h4 className="mb-4 font-inter text-xs font-bold uppercase tracking-wide text-gray-500">
                Message context — {selected.context.dealLabel}
              </h4>
              <div className="mb-6 flex max-h-[min(480px,50vh)] flex-col gap-4 overflow-y-auto pr-1">
                {selected.context.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn('flex flex-col gap-1', m.align === 'right' ? 'items-end' : 'items-start')}
                  >
                    <span
                      className={cn(
                        'font-inter text-[10px] font-bold uppercase',
                        m.flagged ? 'text-[#C0392B]' : 'text-gray-500',
                        m.align === 'right' && 'text-right',
                      )}
                    >
                      {m.meta}
                    </span>
                    <div
                      className={cn(
                        'max-w-[90%] rounded-xl p-4 font-inter text-sm text-tract-obsidian',
                        m.align === 'left' ? 'rounded-tl-none bg-tract-alabaster' : 'rounded-tr-none border border-tract-gold/20 bg-tract-gold/10 text-right',
                        m.flagged && m.align === 'left' && 'border-2 border-[#C0392B]/20 bg-tract-alabaster',
                        m.flagged && m.align === 'right' && 'border-2 border-[#C0392B]/20 bg-tract-gold/10',
                      )}
                    >
                      {m.body}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-black/10 pt-6">
                <button
                  type="button"
                  onClick={() => toast.success('Warning issued (demo).')}
                  className="w-full rounded-lg border-2 border-tract-gold py-3 font-inter text-sm font-semibold uppercase tracking-widest text-tract-obsidian transition-colors hover:bg-tract-gold/10"
                >
                  Issue warning
                </button>
                <button
                  type="button"
                  onClick={() => toast.message('Suspend user flow coming soon.')}
                  className="w-full rounded-lg bg-[#C0392B] py-3 font-inter text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                >
                  Suspend user
                </button>
                <button
                  type="button"
                  onClick={() => toast.message('Flag dismissed (demo).')}
                  className="w-full py-2 text-center font-inter text-sm font-semibold text-gray-500 transition-colors hover:text-tract-obsidian"
                >
                  Dismiss flag
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
