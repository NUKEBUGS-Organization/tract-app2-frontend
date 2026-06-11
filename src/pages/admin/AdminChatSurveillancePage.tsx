import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCircle2, Loader2, RefreshCw, Search, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { cn } from '@/lib/utils'
import { useBanUser, useFlaggedMessages, type FlaggedMessage } from '@/hooks/useAdmin'

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
  senderId: string
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

function pillForFlag(flagType: string): { className: string; style?: CSSProperties } {
  if (flagType === 'external_link') return { className: 'text-white', style: { backgroundColor: BURGUNDY } }
  return { className: 'bg-[#93000a] text-white' }
}

function mapMessage(m: FlaggedMessage): FlaggedRow {
  const shortDeal = m.dealId ? m.dealId.slice(-6) : '—'
  const preview = m.content.length > 48 ? `${m.content.slice(0, 48)}…` : m.content
  const pill = pillForFlag(m.flagType)
  const t = new Date(m.createdAt)
  const time = Number.isNaN(t.getTime()) ? '—' : t.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  const body: ReactNode = (
    <span>
      {m.content.split(/(\+?\d[\d\s().-]{8,}|[\w.+-]+@[\w.-]+\.\w+|https?:\/\/\S+)/gi).map((part, i) => {
        if (/^\+?\d[\d\s().-]{8,}$/.test(part) || /@/.test(part) || /^https?:\/\//i.test(part)) {
          return (
            <span key={i} className="rounded-full bg-[#C0392B] px-2 py-0.5 font-bold text-white">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </span>
  )

  return {
    id: m.id,
    senderId: m.senderId,
    deal: `#${shortDeal}`,
    sender: `${m.senderName}`,
    preview: `"${preview}"`,
    flagLabel: m.flagLabel || 'Flagged',
    flagPillClass: pill.className,
    flagPillStyle: pill.style,
    time,
    borderLeftColor: m.flagType === 'external_link' ? BURGUNDY : RED,
    resolved: m.isBlocked ?? false,
    context: {
      dealLabel: `#Deal-${shortDeal}`,
      messages: [
        {
          id: 'ctx-1',
          align: 'left',
          meta: `${m.senderName} (${m.senderRole}) • flagged`,
          body,
          flagged: true,
        },
      ],
    },
  }
}

function rowBorderStyle(row: FlaggedRow): CSSProperties | undefined {
  if (row.borderLeftColor) return { borderLeftColor: row.borderLeftColor }
  return undefined
}

export default function AdminChatSurveillancePage() {
  const queryClient = useQueryClient()
  const banUser = useBanUser()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, refetch } = useFlaggedMessages(page, 20)

  const displayMessages = useMemo(() => {
    const messages = data?.messages ?? []
    if (!search.trim()) return messages
    const q = search.toLowerCase()
    return messages.filter(
      (m) => m.content.toLowerCase().includes(q) || m.senderName.toLowerCase().includes(q),
    )
  }, [data?.messages, search])

  const rows = useMemo(() => displayMessages.map(mapMessage), [displayMessages])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(() => {
    if (rows.length === 0) return null
    const sid = selectedId && rows.some((r) => r.id === selectedId) ? selectedId : rows[0].id
    return rows.find((r) => r.id === sid) ?? rows[0]
  }, [rows, selectedId])

  const blockedOnPage = (data?.messages ?? []).filter((m) => m.isBlocked).length
  const openOnPage = (data?.messages ?? []).filter((m) => !m.isBlocked).length

  if (isLoading && !data) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-theme-bg font-inter text-theme-text">
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-theme-bg font-inter text-theme-text">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <p className="font-inter text-theme-muted">Failed to load flagged messages.</p>
          <button type="button" onClick={() => void refetch()} className="flex items-center gap-2 text-tract-gold font-inter text-sm font-bold uppercase">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-theme-bg font-inter text-theme-text">
      <main className="min-h-screen px-4 py-8 md:p-10">
        <header className="sticky top-0 z-40 -mx-4 mb-6 flex w-full items-center justify-between border-b border-theme-border bg-theme-topbar px-4 py-3 md:-mx-10 md:px-8">
          <h2 className="font-playfair text-xl font-bold text-theme-text">Chat surveillance</h2>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <button type="button" onClick={() => void refetch()} className="font-inter text-xs text-theme-muted hover:text-tract-gold">
              Refresh
            </button>
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted" strokeWidth={2} aria-hidden />
              <input
                type="search"
                placeholder="Search conversations..."
                value={search}
                className="w-52 rounded-full border-0 bg-theme-surface-2 py-2 pl-10 pr-4 font-inter text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:ring-1 focus:ring-tract-gold md:w-64"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 text-theme-muted">
              <button type="button" className="hover:text-tract-gold" aria-label="Notifications">
                <Bell className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <button type="button" className="hover:text-tract-gold" aria-label="Account">
                <UserCircle className="h-6 w-6" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="font-playfair text-[28px] font-bold text-theme-text">Chat surveillance</h2>
            <p className="mt-2 max-w-3xl font-inter text-base text-theme-muted">Flagged in-app messages from the database (page {page} of {data?.pages ?? 1}).</p>
          </div>

          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { label: 'Flagged (total)', value: String(data?.total ?? 0), color: '#C0392B' },
              { label: 'Auto-blocked (page)', value: String(blockedOnPage), color: '#F4A2AD' },
              { label: 'Open on page', value: String(openOnPage), color: '#D4AF37' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex h-32 flex-col justify-between rounded-xl border border-black/10 bg-theme-card p-6 transition-transform hover:scale-[1.02] hover:border-tract-gold/60"
              >
                <span className="font-inter text-xs font-bold uppercase tracking-wide text-theme-muted">{s.label}</span>
                <span className="font-playfair text-5xl font-bold leading-none" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1 rounded-xl border border-black/10 bg-theme-card p-6">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-playfair text-xl font-bold text-theme-text">Flagged messages</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded bg-theme-surface-2 px-4 py-2 font-inter text-xs font-bold uppercase tracking-wide text-theme-text disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= (data?.pages ?? 1)}
                    onClick={() => setPage((p) => Math.min(data?.pages ?? 1, p + 1))}
                    className="rounded bg-theme-surface-2 px-4 py-2 font-inter text-xs font-bold uppercase tracking-wide text-theme-text disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
              {rows.length === 0 ? (
                <p className="py-8 text-center font-inter text-sm text-theme-muted">No flagged messages.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-black/10">
                        {['Deal', 'Sender', 'Message preview', 'Flag type', 'Time', 'Action'].map((h) => (
                          <th key={h} className="py-4 font-inter text-xs font-bold uppercase tracking-wide text-theme-muted">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-inter text-sm text-theme-text">
                      {rows.map((row) => {
                        const pillStyle = row.flagPillStyle
                        return (
                          <tr
                            key={row.id}
                            className={cn(
                              'group cursor-pointer border-b border-black/10 transition-colors hover:bg-theme-bg',
                              selected?.id === row.id && 'bg-theme-bg/80',
                            )}
                            onClick={() => setSelectedId(row.id)}
                          >
                            <td className="border-l-4 border-transparent py-4 pl-3 font-medium" style={rowBorderStyle(row)}>
                              {row.deal}
                            </td>
                            <td className="py-4 font-semibold">{row.sender}</td>
                            <td className="py-4 italic text-theme-muted">{row.preview}</td>
                            <td className="py-4">
                              <span
                                className={cn('inline-block rounded-full px-2 py-1 font-inter text-[10px] font-bold uppercase tracking-tighter', row.flagPillClass)}
                                style={pillStyle}
                              >
                                {row.flagLabel}
                              </span>
                            </td>
                            <td className="py-4 text-theme-muted">{row.time}</td>
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
                                    Blocked <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
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
              )}
            </div>

            <aside className="w-full shrink-0 lg:w-[400px]">
              {selected ? (
                <div className="sticky top-24 flex flex-col rounded-xl border border-black/10 bg-theme-card p-6 shadow-lg">
                  <h4 className="mb-4 font-inter text-xs font-bold uppercase tracking-wide text-theme-muted">Message context — {selected.context.dealLabel}</h4>
                  <div className="mb-6 flex max-h-[min(480px,50vh)] flex-col gap-4 overflow-y-auto pr-1">
                    {selected.context.messages.map((m) => (
                      <div key={m.id} className={cn('flex flex-col gap-1', m.align === 'right' ? 'items-end' : 'items-start')}>
                        <span className={cn('font-inter text-[10px] font-bold uppercase', m.flagged ? 'text-[#C0392B]' : 'text-theme-muted', m.align === 'right' && 'text-right')}>
                          {m.meta}
                        </span>
                        <div
                          className={cn(
                            'max-w-[90%] rounded-xl p-4 font-inter text-sm text-theme-text',
                            m.align === 'left' ? 'rounded-tl-none bg-theme-bg' : 'rounded-tr-none border border-tract-gold/20 bg-tract-gold/10 text-right',
                            m.flagged && m.align === 'left' && 'border-2 border-[#C0392B]/20 bg-theme-bg',
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
                      onClick={() => {
                        if (confirm(`Issue warning to ${selected.sender}?`)) {
                          toast.success('Warning issued to user.')
                        }
                      }}
                      className="w-full rounded-lg border-2 border-tract-gold py-3 font-inter text-sm font-semibold uppercase tracking-widest text-theme-text transition-colors hover:bg-tract-gold/10"
                    >
                      Issue warning
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selected) return
                        if (
                          window.confirm(`Suspend ${selected.sender} for 7 days?`)
                        ) {
                          banUser.mutate({
                            userId: selected.senderId,
                            reason: 'Anti-circumvention violation in chat',
                            permanent: false,
                            durationDays: 7,
                          })
                        }
                      }}
                      className="w-full rounded-lg bg-[#C0392B] py-3 font-inter text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                    >
                      Suspend user
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['admin', 'chat-flagged'] })
                        toast.success('Flag dismissed.')
                      }}
                      className="w-full py-2 text-center font-inter text-sm font-semibold text-theme-muted transition-colors hover:text-theme-text"
                    >
                      Dismiss flag
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rounded-xl border border-black/10 bg-theme-card p-6 text-center font-inter text-sm text-theme-muted">No message selected.</p>
              )}
            </aside>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
