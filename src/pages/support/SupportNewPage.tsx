import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import SupportLayout from '@/components/support/SupportLayout'
import { useCreateTicket, type TicketPriority } from '@/hooks/useSupport'
import { cn } from '@/lib/utils'

const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'urgent']

export default function SupportNewPage() {
  const navigate = useNavigate()
  const createTicket = useCreateTicket()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')

  const inputClass = cn(
    'w-full rounded-lg border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none',
    'placeholder:text-app1-text-muted focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30',
  )

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const ticket = await createTicket.mutateAsync({ subject, description, priority })
      toast.success('Support ticket submitted.')
      navigate(`/support/${ticket?.id ?? ''}`)
    } catch {
      toast.error('Failed to submit ticket.')
    }
  }

  return (
    <SupportLayout>
      <div className="min-h-screen bg-app1-bg-main p-6 md:p-10">
        <div className="mx-auto max-w-[640px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">Help Center</p>
          <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">New ticket</h1>
          <p className="mt-2 font-poppins text-sm text-app1-text-muted">
            <Link to="/support" className="text-app1-secondary hover:underline">
              ← Back to tickets
            </Link>
          </p>

          <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
            <div>
              <label className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputClass}
                placeholder="Brief summary"
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className={inputClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(inputClass, 'min-h-[140px] resize-y')}
                placeholder="Describe the issue in detail…"
                required
                minLength={10}
              />
            </div>
            <button
              type="submit"
              disabled={createTicket.isPending}
              className="flex w-full items-center justify-center gap-2 bg-app1-secondary py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              {createTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit ticket
            </button>
          </form>
        </div>
      </div>
    </SupportLayout>
  )
}
