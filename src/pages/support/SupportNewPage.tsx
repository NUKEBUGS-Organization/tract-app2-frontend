import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send } from 'lucide-react'
import SupportLayout from '@/components/support/SupportLayout'
import { useCreateTicket } from '@/hooks/useSupport'
import { cn } from '@/lib/utils'

const schema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(20, 'Please provide more detail (min 20 characters)').max(5000),
  category: z.string().min(1, 'Select a category'),
})

type FormData = z.infer<typeof schema>

const CATEGORIES = [
  'Account & Verification',
  'Transaction Fees & Payments',
  'Bidding & Closing Process',
  'Shared Platform Mechanics & Security',
  'Technical Issue',
  'Other',
]

const inputClass = cn(
  'w-full rounded-lg border border-app1-border-light bg-app1-bg-soft px-4 py-3 font-poppins text-[14px] text-app1-text-main outline-none',
  'placeholder:text-app1-text-muted transition-colors focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30',
)

const labelClass = cn(
  'mb-2 block font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted',
)

export default function SupportNewPage() {
  const navigate = useNavigate()
  const createTicket = useCreateTicket()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: '' },
  })

  const onSubmit = async (data: FormData) => {
    createTicket.mutate(
      {
        subject: data.subject,
        description: `[${data.category}]\n\n${data.description}`,
      },
      {
        onSuccess: (ticket) => {
          if (ticket?.id) navigate(`/support/${ticket.id}`)
        },
      },
    )
  }

  return (
    <SupportLayout>
      <div className="mx-auto max-w-[640px] space-y-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">Support</p>
          <h1 className="mt-1 font-cinzel text-2xl font-black text-app1-primary">Open a Ticket</h1>
          <p className="mt-2 font-poppins text-[14px] text-app1-text-muted">
            Describe your issue and our team will respond within 24 hours.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card"
        >
          <div>
            <label className={labelClass}>Category</label>
            <select {...register('category')} className={inputClass}>
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="mt-1 font-poppins text-[12px] text-app1-danger">{errors.category.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="subject" className={labelClass}>
              Subject
            </label>
            <input
              id="subject"
              type="text"
              placeholder="Brief summary of your issue"
              {...register('subject')}
              className={inputClass}
            />
            {errors.subject ? (
              <p className="mt-1 font-poppins text-[12px] text-app1-danger">{errors.subject.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              rows={6}
              placeholder="Describe your issue in detail…"
              {...register('description')}
              className={cn(inputClass, 'resize-none')}
            />
            {errors.description ? (
              <p className="mt-1 font-poppins text-[12px] text-app1-danger">{errors.description.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || createTicket.isPending}
            className="flex w-full items-center justify-center gap-2 bg-app1-secondary py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            {createTicket.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </SupportLayout>
  )
}
