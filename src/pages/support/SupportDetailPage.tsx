import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'
import SupportLayout from '@/components/support/SupportLayout'
import { STATUS_CONFIG } from '@/pages/support/SupportListPage'
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
    'placeholder:text-app1-text-muted transition-colors focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30',
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
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
        </div>
      </SupportLayout>
    )
  }

  const statusCfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open
  const StatusIcon = statusCfg.icon

  return (
    <SupportLayout>
      <div className="mx-auto max-w-[800px] space-y-6">
        <div>
          <Link to="/support" className="font-poppins text-[13px] font-bold text-app1-secondary hover:underline">
            ← My Tickets
          </Link>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">Support</p>
              <h1 className="mt-1 font-cinzel text-2xl font-black text-app1-primary md:text-3xl">{ticket.subject}</h1>
              <p className="mt-2 font-poppins text-[13px] text-app1-text-muted">
                {ticket.priority} priority
                {ticket.assignedTo ? ' · assigned' : ''}
              </p>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                statusCfg.className,
              )}
            >
              <StatusIcon className="h-3 w-3" strokeWidth={2} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
          <p className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
            Original request
          </p>
          <p className="mt-3 whitespace-pre-wrap font-poppins text-[14px] leading-relaxed text-app1-text-main">
            {ticket.description}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap gap-3 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-4 shadow-app1-card">
            <button
              type="button"
              onClick={() => void claim()}
              disabled={claimTicket.isPending}
              className="bg-app1-secondary px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              Claim ticket
            </button>
            <select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)} className={cn(inputClass, 'w-auto')}>
              <option value="">Set status…</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void updateStatus()}
              disabled={!status || updateTicket.isPending}
              className="border border-app1-border-light px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted transition-colors hover:bg-app1-bg-soft disabled:opacity-50"
            >
              Update status
            </button>
          </div>
        ) : null}

        <div className="space-y-4">
          {ticket.messages.map((m, i) => {
            const mine = m.senderId === user?.id
            return (
              <div
                key={`${m.createdAt}-${i}`}
                className={cn(
                  'rounded-2xl px-5 py-4',
                  mine
                    ? 'ml-8 bg-app1-primary text-white'
                    : 'mr-8 border border-app1-border-light bg-app1-bg-soft text-app1-text-main',
                )}
              >
                <p
                  className={cn(
                    'font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                    mine ? 'text-white/70' : 'text-app1-text-muted',
                  )}
                >
                  {m.senderRole.replace('_', ' ')} ·{' '}
                  {new Date(m.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="mt-2 whitespace-pre-wrap font-poppins text-[14px] leading-relaxed">{m.body}</p>
              </div>
            )
          })}
        </div>

        <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card">
          <label className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
            Reply
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className={cn(inputClass, 'min-h-[120px] resize-none')}
            placeholder="Write your message…"
          />
          <button
            type="button"
            onClick={() => void sendReply()}
            disabled={updateTicket.isPending || !reply.trim()}
            className="mt-4 inline-flex items-center gap-2 bg-app1-secondary px-6 py-2.5 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            {updateTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send reply
          </button>
        </div>
      </div>
    </SupportLayout>
  )
}
