import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import SupportLayout from '@/components/support/SupportLayout'
import {
  useClaimTicket,
  useTicket,
  useUpdateTicket,
  type TicketStatus,
} from '@/hooks/useSupport'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']

export default function SupportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const { data: ticket, isLoading } = useTicket(id)
  const updateTicket = useUpdateTicket(id ?? '')
  const claimTicket = useClaimTicket(id ?? '')
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')

  const inputClass = cn(
    'w-full rounded-lg border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none',
    'placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30',
  )

  const sendReply = async () => {
    if (!reply.trim()) return
    try {
      await updateTicket.mutateAsync({ reply: reply.trim() })
      setReply('')
      toast.success('Reply sent.')
    } catch {
      toast.error('Failed to send reply.')
    }
  }

  const updateStatus = async () => {
    if (!status) return
    try {
      await updateTicket.mutateAsync({ status })
      toast.success('Status updated.')
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const claim = async () => {
    try {
      await claimTicket.mutateAsync()
      toast.success('Ticket claimed.')
    } catch {
      toast.error('Failed to claim ticket.')
    }
  }

  if (isLoading || !ticket) {
    return (
      <SupportLayout>
        <div className="flex min-h-screen items-center justify-center bg-app1-bg-main">
          <Loader2 className="h-8 w-8 animate-spin text-app1-secondary" />
        </div>
      </SupportLayout>
    )
  }

  return (
    <SupportLayout>
      <div className="min-h-screen bg-app1-bg-main p-6 md:p-10">
        <div className="mx-auto max-w-[800px]">
          <Link to="/support" className="font-poppins text-sm font-bold text-app1-secondary hover:underline">
            ← All tickets
          </Link>
          <h1 className="mt-4 font-cinzel text-2xl font-black text-app1-primary md:text-3xl">{ticket.subject}</h1>
          <p className="mt-2 font-poppins text-[13px] text-app1-text-muted">
            {ticket.status.replace('_', ' ')} · {ticket.priority} priority
            {ticket.assignedTo ? ` · assigned` : ''}
          </p>

          {isAdmin ? (
            <div className="mt-6 flex flex-wrap gap-3 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-4 shadow-app1-card">
              <button
                type="button"
                onClick={() => void claim()}
                disabled={claimTicket.isPending}
                className="bg-app1-secondary px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark"
              >
                Claim ticket
              </button>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TicketStatus)}
                className={cn(inputClass, 'w-auto')}
              >
                <option value="">Set status…</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void updateStatus()}
                disabled={!status || updateTicket.isPending}
                className="border border-app1-border-light px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted"
              >
                Update status
              </button>
            </div>
          ) : null}

          <div className="mt-8 space-y-4">
            {ticket.messages.map((m, i) => {
              const mine = m.senderId === user?.id
              return (
                <div
                  key={`${m.createdAt}-${i}`}
                  className={cn(
                    'rounded-2xl border px-5 py-4',
                    mine
                      ? 'ml-8 border-app1-primary/20 bg-app1-primary/5'
                      : 'mr-8 border-app1-border-light bg-app1-bg-card',
                  )}
                >
                  <p className="font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                    {m.senderRole.replace('_', ' ')} · {new Date(m.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap font-poppins text-[14px] text-app1-text-main">{m.body}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-5 shadow-app1-card">
            <label className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
              Reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className={cn(inputClass, 'min-h-[100px] resize-y')}
              placeholder="Write your message…"
            />
            <button
              type="button"
              onClick={() => void sendReply()}
              disabled={updateTicket.isPending || !reply.trim()}
              className="mt-3 inline-flex items-center gap-2 bg-app1-secondary px-6 py-2.5 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark disabled:opacity-50"
            >
              {updateTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send reply
            </button>
          </div>
        </div>
      </div>
    </SupportLayout>
  )
}
