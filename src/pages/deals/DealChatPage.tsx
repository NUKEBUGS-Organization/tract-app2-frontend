import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import {
  AlertTriangle,
  Gavel,
  Home,
  MessageCircle,
  MessageSquare,
  Send,
  Shield,
  User,
  X,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useChatMessages, useDeal, useSendMessage } from '@/hooks/useDeal'
import { useChatSocket } from '@/hooks/useSocket'
import type { ChatMessage } from '@/types'

function dealLabel(dealId: string): string {
  return `#Deal-${dealId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'TRACT'}`
}

function senderLabel(m: ChatMessage): string {
  const s = m.senderId
  if (s && typeof s === 'object' && 'fullName' in s) {
    return String((s as { fullName?: string }).fullName ?? 'Member')
  }
  return 'Member'
}

export default function DealChatPage() {
  const { id: dealId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const dealRef = useMemo(() => (dealId ? dealLabel(dealId) : ''), [dealId])
  const { data: deal } = useDeal(dealId)

  const listingIdForNav = useMemo(() => {
    const lid = deal?.listingId
    if (!lid) return undefined
    if (typeof lid === 'object') {
      const o = lid as { _id?: string; id?: string }
      return String(o._id ?? o.id ?? '')
    }
    return String(lid)
  }, [deal?.listingId])

  useEffect(() => {
    if (!dealId) {
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [dealId, navigate])

  const onSocketChat = useCallback(() => {
    if (!dealId) return
    void queryClient.invalidateQueries({ queryKey: ['chat', dealId] })
  }, [dealId, queryClient])

  useChatSocket(dealId, onSocketChat)

  const {
    data: chatData,
    isLoading,
    isError,
    error,
  } = useChatMessages(dealId)
  const sendMessage = useSendMessage(dealId)

  const messages = chatData?.messages ?? []
  const chatLocked =
    isError && isAxiosError(error) && error.response?.status === 403

  const [messageText, setMessageText] = useState('')
  const [showViolationWarning, setShowViolationWarning] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!messageText.trim() || chatLocked) return
    sendMessage.mutate(messageText.trim(), {
      onSuccess: (result) => {
        setMessageText('')
        const msg = result as ChatMessage | undefined
        if (msg?.isBlocked) {
          setShowViolationWarning(true)
        }
      },
    })
  }

  if (!dealId) return null

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="relative flex h-screen min-h-0 flex-1 flex-col overflow-hidden bg-app1-bg-main font-poppins text-app1-text-main">
      <main className="relative flex min-h-0 flex-1 flex-col bg-app1-bg-soft pb-16 md:pb-0">
        {showViolationWarning ? (
          <div className="absolute left-1/2 top-20 z-50 w-full max-w-md -translate-x-1/2 px-4">
            <div className="relative flex items-start gap-3 rounded-xl border border-app1-warning/40 bg-app1-warning py-4 pl-4 pr-10 text-white shadow-lg">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              <p className="min-w-0 flex-1 font-poppins text-sm leading-snug">
                Contact information detected and blocked. Repeated violations may suspend your account.
              </p>
              <button
                type="button"
                onClick={() => setShowViolationWarning(false)}
                className="absolute right-2 top-2 rounded p-1 hover:bg-white/10"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>
        ) : null}

        <header className="z-10 flex h-20 shrink-0 items-center justify-between gap-3 border-b border-app1-border-light bg-app1-bg-card px-4 md:px-6">
          <div className="min-w-0">
            <h2 className="truncate font-cinzel text-base font-black text-app1-primary md:text-lg">4821 Maple Drive</h2>
            <span className="font-poppins text-[12px] font-bold tracking-wide text-app1-text-muted">{dealRef}</span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-app1-primary/20 bg-app1-primary/10 px-3 py-1.5 sm:flex">
            <Shield className="h-4 w-4 text-app1-primary" strokeWidth={2} aria-hidden />
            <span className="font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
              Encrypted &amp; audited
            </span>
          </div>
          <Link
            to={`/deals/${dealId}`}
            className="shrink-0 rounded-full border border-app1-secondary/40 px-3 py-1.5 font-poppins text-xs font-bold text-app1-secondary transition-colors hover:bg-app1-secondary/10"
          >
            Deal details
          </Link>
        </header>

        <section className="deal-chat-scroll min-h-0 flex-1 space-y-6 overflow-y-auto bg-app1-bg-main p-6 md:space-y-8 md:p-8">
          {isLoading ? (
            <div className="flex justify-center py-16 font-poppins text-sm text-app1-text-muted">Loading messages…</div>
          ) : chatLocked ? (
            <div className="mx-auto max-w-md rounded-app1-card border border-app1-warning/40 bg-app1-warning/10 p-6 text-center font-poppins text-sm text-app1-text-main">
              Chat will unlock after both parties sign.
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-app1-border-light bg-app1-bg-soft">
                <MessageSquare className="h-8 w-8 text-app1-text-muted" strokeWidth={1} aria-hidden />
              </div>
              <p className="font-cinzel text-[18px] font-black text-app1-primary">No messages yet</p>
              <p className="max-w-xs font-poppins text-[13px] text-app1-text-muted">
                This chat is encrypted and audited. All messages are monitored for compliance.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <p className="text-center font-poppins text-xs italic text-app1-text-muted">Messages are filtered for contact info.</p>
              </div>

              {messages.map((m) => {
                const ts = new Date(m.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })
                if (m.isSystemMessage) {
                  return (
                    <div key={m._id} className="flex justify-center">
                      <p className="text-center font-poppins text-xs italic text-app1-text-muted">{m.content}</p>
                    </div>
                  )
                }
                if (m.isBlocked) {
                  return (
                    <div key={m._id} className="flex justify-center">
                      <div className="max-w-sm rounded-app1-card border border-app1-danger/50 bg-app1-danger/10 p-4 text-center">
                        <div className="mb-1 flex items-center justify-center gap-1 text-app1-danger">
                          <AlertTriangle className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                          <span className="font-poppins text-sm font-bold">Message Blocked — Contact info detected</span>
                        </div>
                        <p className="font-poppins text-xs text-app1-text-muted">{m.blockedReason ?? m.content}</p>
                        <p className="mt-1 font-poppins text-[11px] text-app1-text-muted">{ts}</p>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={m._id} className="flex max-w-2xl gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-app1-border-light bg-app1-bg-soft font-poppins text-[10px] font-black text-app1-text-muted">
                      {senderLabel(m).slice(0, 1)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <span className="ml-1 font-poppins text-[11px] font-black uppercase tracking-[0.12em] text-app1-text-muted">
                        {senderLabel(m)}
                      </span>
                      <div className="rounded-xl rounded-bl-none border border-app1-border-light bg-app1-bg-card p-4 text-app1-text-main shadow-sm">
                        <p className="font-poppins text-sm leading-relaxed">{m.content}</p>
                      </div>
                      <span className="ml-1 font-poppins text-[11px] text-app1-text-muted">{ts}</span>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} className="h-1" aria-hidden />
            </>
          )}
        </section>

        <footer className="fixed bottom-16 left-0 right-0 z-40 flex h-20 shrink-0 items-center gap-3 border-t border-app1-border-light bg-app1-bg-card px-4 md:relative md:bottom-auto md:left-auto md:right-auto md:z-10">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              disabled={chatLocked || isLoading}
              placeholder={chatLocked ? 'Chat locked' : 'Type a message...'}
              className="w-full rounded-full border border-app1-border-light bg-app1-bg-main py-2.5 pl-5 pr-4 font-poppins text-sm text-app1-text-main placeholder:text-app1-text-muted focus:outline-none focus:ring-2 focus:ring-app1-secondary/40 disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={chatLocked || isLoading || sendMessage.isPending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app1-secondary text-app1-primary-dark shadow-app1-premium transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            aria-label="Send message"
          >
            {sendMessage.isPending ? (
              <span className="h-5 w-5 animate-pulse font-poppins text-[10px]">…</span>
            ) : (
              <Send className="h-5 w-5" strokeWidth={2} aria-hidden />
            )}
          </button>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-app1-border-light bg-app1-bg-card px-4 md:hidden">
        <Link to="/buyer/dashboard" className="flex flex-col items-center gap-1 text-app1-text-muted">
          <Home className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-poppins text-[10px] font-black uppercase tracking-[0.14em]">Home</span>
        </Link>
        <span className="flex flex-col items-center gap-1 text-app1-secondary">
          <MessageCircle className="h-6 w-6" strokeWidth={2} aria-hidden />
          <span className="font-poppins text-[10px] font-black uppercase tracking-[0.14em]">Messages</span>
        </span>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-app1-text-muted"
          onClick={() => {
            if (listingIdForNav) navigate(`/wholesaler/listings/${listingIdForNav}`)
            else navigate('/buyer/bids')
          }}
        >
          <Gavel className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-poppins text-[10px] font-black uppercase tracking-[0.14em]">Bids</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 text-app1-text-muted" onClick={() => navigate('/buyer/profile')}>
          <User className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          <span className="font-poppins text-[10px] font-black uppercase tracking-[0.14em]">Profile</span>
        </button>
      </nav>
      </div>
    </DashboardLayout>
  )
}
