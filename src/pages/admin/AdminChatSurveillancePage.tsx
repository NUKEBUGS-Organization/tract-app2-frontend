import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageHeader from '@/components/app1/PageHeader'
import { useAdminChatConversations, useAdminChatHistory, useBanUser } from '@/hooks/useAdmin'

const buttonClass = 'rounded-lg border border-app1-border-light px-3 py-2 text-sm disabled:opacity-40'

export default function AdminChatSurveillancePage() {
  const banUser = useBanUser()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [draftSearch, setDraftSearch] = useState('')
  const [flagged, setFlagged] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const conversations = useAdminChatConversations(page, search, flagged)
  const rows = conversations.data?.conversations ?? []
  const selected = rows.find((row) => row.dealId === selectedId) ?? rows[0]
  const history = useAdminChatHistory(selected?.dealId, historyPage)
  const reset = () => { setPage(1); setSelectedId(null); setHistoryPage(1) }

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <main className="min-h-screen space-y-6 px-4 py-8 md:p-10">
        <PageHeader eyebrow="Admin Workspace" title="Chat Surveillance" description="Review all deal conversations, including messages blocked before delivery."
          actions={<button className={buttonClass} onClick={() => { void conversations.refetch(); if (selected) void history.refetch() }}><RefreshCw className="mr-2 inline h-4 w-4" />Refresh</button>} />
        <div className="flex flex-wrap items-center gap-3">
          <button aria-pressed={!flagged} className={`${buttonClass} ${!flagged ? 'bg-app1-secondary text-black' : ''}`} onClick={() => { setFlagged(false); reset() }}>All conversations</button>
          <button aria-pressed={flagged} className={`${buttonClass} ${flagged ? 'bg-app1-secondary text-black' : ''}`} onClick={() => { setFlagged(true); reset() }}>Flagged conversations</button>
          <form className="flex min-w-0 flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); setSearch(draftSearch); reset() }}>
            <input aria-label="Search conversations" type="search" maxLength={200} value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} placeholder="Participant, property or deal ID" className="min-w-0 flex-1 rounded-lg border border-app1-border-light bg-app1-bg-card px-3 py-2" />
            <button className={buttonClass}>Search</button>
          </form>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="min-w-0 space-y-3 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-5">
            <h2 className="font-semibold">{conversations.data?.total ?? 0} conversations</h2>
            {conversations.isLoading && <p role="status">Loading conversations…</p>}
            {conversations.isError && <p role="alert">Could not load conversations. Please refresh.</p>}
            {!conversations.isLoading && !conversations.isError && rows.length === 0 && <p>No conversations found.</p>}
            {rows.map((row) => (
              <button key={row.dealId} onClick={() => { setSelectedId(row.dealId); setHistoryPage(1) }} aria-pressed={selected?.dealId === row.dealId}
                className={`block w-full rounded-xl border p-4 text-left ${selected?.dealId === row.dealId ? 'border-app1-secondary bg-app1-secondary/10' : 'border-app1-border-light'}`}>
                <p className="break-words font-semibold">{row.propertyAddress}</p>
                <p className="mt-1 break-words text-sm">{row.buyerName} · {row.sellerName}</p>
                <p className="mt-1 text-xs text-app1-text-muted">Deal #{row.dealId.slice(-6)} · {new Date(row.lastMessageAt).toLocaleString()}</p>
                <p className="my-2 truncate text-sm text-app1-text-muted">{row.lastMessage}</p>
                <p className="text-xs">{row.messageCount} messages · {row.flaggedCount} flagged · {row.blockedCount} blocked</p>
              </button>
            ))}
            <div className="flex items-center justify-between gap-2 pt-3">
              <button className={buttonClass} disabled={page <= 1} onClick={() => { setPage(page - 1); setSelectedId(null); setHistoryPage(1) }}>Previous</button>
              <span className="text-sm">Page {page} of {conversations.data?.pages ?? 1}</span>
              <button className={buttonClass} disabled={page >= (conversations.data?.pages ?? 1)} onClick={() => { setPage(page + 1); setSelectedId(null); setHistoryPage(1) }}>Next</button>
            </div>
          </section>
          <section className="min-w-0 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-5">
            <h2 className="break-words font-semibold">{selected ? `Conversation — ${selected.propertyAddress}` : 'Select a conversation'}</h2>
            {selected && <p className="mt-1 break-all text-xs text-app1-text-muted">Deal {selected.dealId}</p>}
            {history.isLoading && selected && <p role="status">Loading messages…</p>}
            {history.isError && <p role="alert">Could not load messages. Please refresh.</p>}
            <div className="my-4 max-h-[65vh] space-y-3 overflow-y-auto">
              {history.data?.messages.map((message) => (
                <article key={message.id} className={`rounded-lg border p-3 ${message.isFlagged ? 'border-app1-danger/50 bg-app1-danger/5' : 'border-app1-border-light bg-app1-bg-main'}`}>
                  <p className="text-sm font-semibold">{message.senderName} <span className="text-xs font-normal text-app1-text-muted">{message.senderRole}</span></p>
                  <p className="text-xs text-app1-text-muted">{new Date(message.createdAt).toLocaleString()}</p>
                  <p className="my-2 whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  {(message.isFlagged || message.isBlocked) && <p className="text-xs font-semibold text-app1-danger">{message.isBlocked ? 'Blocked — not delivered' : 'Flagged'}{message.flagLabel ? ` · ${message.flagLabel}` : ''}</p>}
                  {message.blockedReason && <p className="mt-1 text-xs text-app1-text-muted">{message.blockedReason}</p>}
                  {message.isFlagged && message.senderId && <button type="button" disabled={banUser.isPending} className="mt-3 rounded border border-app1-danger px-3 py-1 text-xs text-app1-danger disabled:opacity-40" onClick={() => {
                    if (window.confirm(`Suspend ${message.senderName} for 7 days?`)) {
                      banUser.mutate({ userId: message.senderId, reason: 'Anti-circumvention violation in chat', permanent: false, durationDays: 7 })
                    }
                  }}>Suspend sender for 7 days</button>}
                </article>
              ))}
            </div>
            {selected && <div className="flex items-center justify-between gap-2">
              <button className={buttonClass} disabled={historyPage >= (history.data?.pages ?? 1)} onClick={() => setHistoryPage(historyPage + 1)}>Older messages</button>
              <span className="text-xs">{history.data?.total ?? 0} messages</span>
              <button className={buttonClass} disabled={historyPage <= 1} onClick={() => setHistoryPage(historyPage - 1)}>Newer messages</button>
            </div>}
          </section>
        </div>
      </main>
    </DashboardLayout>
  )
}
