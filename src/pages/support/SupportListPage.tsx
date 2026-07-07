import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
} from 'lucide-react'
import SupportLayout from '@/components/support/SupportLayout'
import { useTickets } from '@/hooks/useSupport'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  open: {
    label: 'Open',
    className: 'bg-app1-primary/10 text-app1-primary',
    icon: Clock,
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-app1-secondary/10 text-app1-secondary',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-app1-bg-soft text-app1-text-muted',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed',
    className: 'bg-app1-bg-soft text-app1-text-muted',
    icon: CheckCircle2,
  },
} as const

export default function SupportListPage() {
  const { data: tickets = [], isLoading, isError } = useTickets()

  return (
    <SupportLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">Support</p>
            <h1 className="font-cinzel text-2xl font-black text-app1-primary">My Tickets</h1>
          </div>
          <Link
            to="/support/new"
            className="inline-flex items-center gap-2 bg-app1-secondary px-5 py-2.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
          </div>
        ) : null}

        {isError ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <AlertTriangle className="h-10 w-10 text-app1-danger" />
            <p className="font-poppins text-app1-text-muted">Failed to load tickets.</p>
          </div>
        ) : null}

        {!isLoading && !isError && tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center shadow-app1-card">
            <MessageSquare className="h-16 w-16 text-app1-border-light" strokeWidth={1} />
            <h3 className="font-cinzel text-[22px] font-black text-app1-primary">No tickets yet</h3>
            <p className="max-w-xs font-poppins text-app1-text-muted">
              Have a question or issue? Open a support ticket and our team will respond within 24 hours.
            </p>
            <Link
              to="/support/new"
              className="bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02]"
            >
              Open First Ticket
            </Link>
          </div>
        ) : null}

        {!isLoading && !isError && tickets.length > 0 ? (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const cfg = STATUS_CONFIG[ticket.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.open
              const StatusIcon = cfg.icon
              const replyCount = ticket.messages.length
              return (
                <Link
                  key={ticket.id}
                  to={`/support/${ticket.id}`}
                  className="flex items-start gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-all duration-200 hover:-translate-y-0.5 hover:border-app1-secondary/30 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app1-primary/10">
                    <MessageSquare className="h-5 w-5 text-app1-primary" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-poppins text-[14px] font-black text-app1-text-main">{ticket.subject}</p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                          cfg.className,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" strokeWidth={2} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 font-poppins text-[13px] text-app1-text-muted">{ticket.description}</p>
                    <p className="mt-2 font-poppins text-[11px] text-app1-text-muted">
                      {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {replyCount > 0 && ` · ${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}`}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>
    </SupportLayout>
  )
}

export { STATUS_CONFIG }
