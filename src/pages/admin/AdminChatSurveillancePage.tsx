import type { CSSProperties, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCircle2, Loader2, RefreshCw, Search, UserCircle } from 'lucide-react'
import { toast } from 'sonner'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/app1/PageHeader'
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
            <span key={i} className="rounded-full bg-app1-danger px-2 py-0.5 font-bold text-white">
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
          <p className="font-poppins text-app1-text-muted">Failed to load flagged messages.</p>
          <button type="button" onClick={() => void refetch()} className="flex items-center gap-2 text-app1-secondary font-poppins text-sm font-bold uppercase">
            <RefreshCw className="h-4 w-4" />
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
            title="Chat Surveillance"
            description={`Flagged in-app messages from the database (page ${page} of ${data?.pages ?? 1}).`}
            actions={
              <div className="flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => void refetch()} className="font-poppins text-xs text-app1-text-muted hover:text-app1-secondary">
                  Refresh
                </button>
                <div className="relative hidden sm:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-app1-text-muted" strokeWidth={2} aria-hidden />
                  <input
                    type="search"
                    placeholder="Search conversations..."
                    value={search}
                    className="w-52 rounded-xl border border-app1-border-light bg-app1-bg-soft py-2 pl-10 pr-4 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-1 focus:ring-app1-secondary md:w-64"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 text-app1-text-muted">
                  <button type="button" className="hover:text-app1-secondary" aria-label="Notifications">
                    <Bell className="h-6 w-6" strokeWidth={1.75} />
                  </button>
                  <button type="button" className="hover:text-app1-secondary" aria-label="Account">
                    <UserCircle className="h-6 w-6" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            }
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { label: 'Flagged (total)', value: String(data?.total ?? 0), color: '#C0392B' },
              { label: 'Auto-blocked (page)', value: String(blockedOnPage), color: '#F4A2AD' },
              { label: 'Open on page', value: String(openOnPage), color: '#D4AF37' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex h-32 flex-col justify-between rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-transform hover:scale-[1.02] hover:border-app1-secondary/40"
              >
                <span className="font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-muted">{s.label}</span>
                <span className="font-cinzel text-5xl font-bold leading-none" style={{ color: s.color }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex max-w-[1440px] flex-col gap-6 lg:flex-row">
            <div className="min-w-0 flex-1 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-cinzel text-xl font-bold text-app1-text-main">Flagged messages</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded bg-app1-bg-soft px-4 py-2 font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-main disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= (data?.pages ?? 1)}
                    onClick={() => setPage((p) => Math.min(data?.pages ?? 1, p + 1))}
                    className="rounded bg-app1-bg-soft px-4 py-2 font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-main disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
              {rows.length === 0 ? (
                <p className="py-8 text-center font-poppins text-sm text-app1-text-muted">No flagged messages.</p>
              ) : (
                <div className="space-y-3">
                  {rows.map((row) => {
                    const pillStyle = row.flagPillStyle
                    const isSelected = selected?.id === row.id
                    return (
                      <div
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
                          'cursor-pointer rounded-xl border border-app1-danger/30 bg-app1-danger/5 p-4 transition-all hover:border-app1-secondary/40',
                          isSelected && 'ring-2 ring-app1-secondary/30',
                        )}
                        style={rowBorderStyle(row) ? { borderLeftWidth: 4, ...rowBorderStyle(row) } : undefined}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-poppins text-sm font-semibold text-app1-text-main">{row.sender}</p>
                            <p className="mt-1 font-poppins text-xs text-app1-text-muted">{row.deal} · {row.time}</p>
                            <p className="mt-2 font-poppins text-sm italic text-app1-text-muted">{row.preview}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span
                              className={cn('inline-block rounded-full px-2 py-1 font-poppins text-[10px] font-bold uppercase tracking-tighter', row.flagPillClass)}
                              style={pillStyle}
                            >
                              {row.flagLabel}
                            </span>
                            <button
                              type="button"
                              className="font-poppins text-sm font-semibold text-app1-secondary hover:underline"
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
                                className="rounded border border-app1-danger px-2 py-1 font-poppins text-sm font-semibold text-app1-danger transition-colors hover:bg-app1-danger hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast.message(`Warning draft queued for ${row.sender}`)
                                }}
                              >
                                Warn user
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-poppins text-sm font-semibold text-app1-primary">
                                Blocked <CheckCircle2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <aside className="w-full shrink-0 lg:w-[400px]">
              {selected ? (
                <div className="sticky top-24 flex flex-col rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
                  <h4 className="mb-4 font-poppins text-xs font-bold uppercase tracking-wide text-app1-text-muted">Message context — {selected.context.dealLabel}</h4>
                  <div className="mb-6 flex max-h-[min(480px,50vh)] flex-col gap-4 overflow-y-auto pr-1">
                    {selected.context.messages.map((m) => (
                      <div key={m.id} className={cn('flex flex-col gap-1', m.align === 'right' ? 'items-end' : 'items-start')}>
                        <span className={cn('font-poppins text-[10px] font-bold uppercase', m.flagged ? 'text-app1-danger' : 'text-app1-text-muted', m.align === 'right' && 'text-right')}>
                          {m.meta}
                        </span>
                        <div
                          className={cn(
                            'max-w-[90%] rounded-xl p-4 font-poppins text-sm text-app1-text-main',
                            m.align === 'left' ? 'rounded-tl-none bg-app1-bg-main' : 'rounded-tr-none border border-app1-secondary/20 bg-app1-secondary/10 text-right',
                            m.flagged && m.align === 'left' && 'border-2 border-app1-danger/20 bg-app1-bg-main',
                            m.flagged && m.align === 'right' && 'border-2 border-app1-danger/20 bg-app1-secondary/10',
                          )}
                        >
                          {m.body}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3 border-t border-app1-border-light pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Issue warning to ${selected.sender}?`)) {
                          toast.success('Warning issued to user.')
                        }
                      }}
                      className="w-full rounded-lg border-2 border-app1-secondary py-3 font-poppins text-sm font-semibold uppercase tracking-widest text-app1-text-main transition-colors hover:bg-app1-secondary/10"
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
                      className="w-full rounded-lg bg-app1-danger py-3 font-poppins text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                    >
                      Suspend user
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['admin', 'chat-flagged'] })
                        toast.success('Flag dismissed.')
                      }}
                      className="w-full py-2 text-center font-poppins text-sm font-semibold text-app1-text-muted transition-colors hover:text-app1-text-main"
                    >
                      Dismiss flag
                    </button>
                  </div>
                </div>
              ) : (
                <p className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 text-center font-poppins text-sm text-app1-text-muted shadow-app1-card">No message selected.</p>
              )}
            </aside>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
