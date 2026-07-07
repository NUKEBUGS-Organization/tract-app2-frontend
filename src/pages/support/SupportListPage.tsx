import { Link } from 'react-router-dom'
import { Loader2, Plus } from 'lucide-react'
import SupportLayout from '@/components/support/SupportLayout'
import { useTickets } from '@/hooks/useSupport'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-app1-primary/10 text-app1-primary',
  closed: 'bg-app1-bg-soft text-app1-text-muted',
}

export default function SupportListPage() {
  const { data: tickets = [], isLoading } = useTickets()

  return (
    <SupportLayout>
      <div className="min-h-screen bg-app1-bg-main p-6 md:p-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">Help Center</p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">Support</h1>
            <p className="mt-2 font-poppins text-sm text-app1-text-muted">
              Track your requests or browse the{' '}
              <Link to="/faq" className="font-bold text-app1-secondary hover:underline">
                FAQ
              </Link>
              .
            </p>
          </div>
          <Link
            to="/support/new"
            className="inline-flex items-center gap-2 bg-app1-secondary px-6 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            New ticket
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-app1-secondary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-10 text-center shadow-app1-card">
            <p className="font-cinzel text-xl font-black text-app1-primary">No tickets yet</p>
            <p className="mt-2 font-poppins text-sm text-app1-text-muted">Open a ticket and our team will respond.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <Link
                key={t.id}
                to={`/support/${t.id}`}
                className="block rounded-app1-card border border-app1-border-light bg-app1-bg-card p-5 shadow-app1-card transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-poppins text-[15px] font-bold text-app1-text-main">{t.subject}</h2>
                    <p className="mt-1 line-clamp-1 font-poppins text-[13px] text-app1-text-muted">{t.description}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                      STATUS_STYLES[t.status] ?? STATUS_STYLES.open,
                    )}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-3 font-poppins text-[11px] text-app1-text-muted">
                  Updated {new Date(t.updatedAt).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </SupportLayout>
  )
}
