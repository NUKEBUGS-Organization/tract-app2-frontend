import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Loader2, Trash2, UserPlus, X } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import {
  useAdminTitleReps,
  useCreateTitleRep,
  useDeleteTitleRep,
  useResendTitleRepInvite,
  type AdminTitleRep,
} from '@/hooks/useAdmin'
import { APP2_STATES } from '@/lib/constants/states'
import { cn } from '@/lib/utils'

const createSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length === 10, 'Enter a 10-digit US phone number'),
  stateCode: z.string().optional(),
})

type CreateForm = z.input<typeof createSchema>

const inputClass =
  'h-11 w-full rounded-lg border border-app1-border-light bg-app1-bg-soft px-3 font-poppins text-[14px] text-app1-text-main outline-none focus:border-app1-secondary focus:ring-2 focus:ring-app1-secondary/30'

function CreateTitleRepPanel({ onDone }: { onDone: () => void }) {
  const createRep = useCreateTitleRep()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) })

  const onSubmit = handleSubmit((values) => {
    const parsed = createSchema.parse(values)
    createRep.mutate(
      {
        fullName: parsed.fullName,
        email: parsed.email,
        phone: `+1${parsed.phone}`,
        ...(parsed.stateCode ? { stateCode: parsed.stateCode } : {}),
      },
      {
        onSuccess: () => {
          reset()
          onDone()
        },
      },
    )
  })

  const field = (name: keyof CreateForm, label: string, input: React.ReactNode) => (
    <label className="flex flex-col gap-1.5">
      <span className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-muted">{label}</span>
      {input}
      {errors[name] ? (
        <span role="alert" className="font-poppins text-[12px] text-app1-danger">
          {errors[name]?.message}
        </span>
      ) : null}
    </label>
  )

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card"
    >
      <div>
        <h3 className="font-cinzel text-xl font-black text-app1-primary">New title representative</h3>
        <p className="mt-1 font-poppins text-[13px] text-app1-text-muted">
          They will be emailed a link to set their own password, then sign in at the normal login page.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {field('fullName', 'Full name', <input {...register('fullName')} className={inputClass} placeholder="Jane Doe" />)}
        {field(
          'email',
          'Email',
          <input {...register('email')} type="email" className={inputClass} placeholder="jane@titleco.com" />,
        )}
        {field(
          'phone',
          'Phone (US)',
          <input {...register('phone')} type="tel" inputMode="numeric" className={inputClass} placeholder="(555) 000-0000" />,
        )}
        {field(
          'stateCode',
          'State (optional)',
          <select {...register('stateCode')} className={inputClass} defaultValue="">
            <option value="">—</option>
            {APP2_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>,
        )}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          className="rounded-[8px] border border-app1-border-light px-5 py-2.5 font-poppins text-[13px] font-bold text-app1-text-muted hover:bg-app1-bg-soft"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createRep.isPending}
          className="inline-flex items-center gap-2 rounded-[8px] bg-app1-secondary px-5 py-2.5 font-poppins text-[13px] font-bold text-white hover:bg-yellow-600 disabled:opacity-50"
        >
          {createRep.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create & send invite
        </button>
      </div>
    </form>
  )
}

function DeleteTitleRepDialog({ rep, onClose }: { rep: AdminTitleRep; onClose: () => void }) {
  const deleteRep = useDeleteTitleRep()
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title-rep-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div className="w-full max-w-[440px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-xl">
        <h3 id="delete-title-rep-heading" className="mb-2 font-cinzel text-[22px] font-bold text-app1-text-main">
          Delete {rep.fullName}?
        </h3>
        <p className="mb-6 font-poppins text-[13px] text-app1-text-muted">
          Their login stops working immediately and they are signed out everywhere.
          {rep.closedDeals > 0
            ? ` Their ${rep.closedDeals} closed ${rep.closedDeals === 1 ? 'deal stays' : 'deals stay'} in the records.`
            : ''}{' '}
          You can add the same email again later.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[8px] border border-app1-border-light py-2.5 font-poppins text-[13px] font-bold text-app1-text-muted hover:bg-app1-bg-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleteRep.isPending}
            onClick={() => deleteRep.mutate(rep.id, { onSuccess: onClose })}
            className="flex-1 rounded-[8px] bg-app1-danger py-2.5 font-poppins text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {deleteRep.isPending ? 'Deleting…' : 'Delete title rep'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminTitleRepsPage() {
  const { data: reps = [], isLoading, isError, refetch } = useAdminTitleReps()
  const resendInvite = useResendTitleRepInvite()
  const [showCreate, setShowCreate] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<AdminTitleRep | null>(null)

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="min-h-screen">
        <div className="mx-auto max-w-[1440px] space-y-6 p-6 md:p-10">
          <PageHeader
            eyebrow="Admin Workspace"
            title="Title Representatives"
            description="Title rep logins can only be created here. Assign them to deals from Title Requests or All Deals."
            actions={
              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex items-center gap-2 rounded-[8px] bg-app1-secondary px-4 py-2.5 font-poppins text-[12px] font-bold text-white hover:bg-yellow-600"
              >
                {showCreate ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {showCreate ? 'Close' : 'Add title rep'}
              </button>
            }
          />

          {showCreate ? <CreateTitleRepPanel onDone={() => setShowCreate(false)} /> : null}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-app1-danger" />
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-poppins text-sm font-bold uppercase tracking-wider text-app1-secondary hover:underline"
              >
                Could not load title reps. Retry
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                      {['Name', 'Contact', 'State', 'Open Deals', 'Closed', 'Status', 'Action'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-4 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted',
                            h === 'Action' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app1-border-light">
                    {reps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center font-poppins text-app1-text-muted">
                          No title representatives yet. Use “Add title rep” to create the first login.
                        </td>
                      </tr>
                    ) : (
                      reps.map((rep) => (
                        <tr key={rep.id} className="transition-colors hover:bg-app1-bg-soft">
                          <td className="px-6 py-4 font-poppins text-[14px] font-bold text-app1-text-main">{rep.fullName}</td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                            <div>{rep.email}</div>
                            <div>{rep.phone}</div>
                          </td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">{rep.stateCode || '—'}</td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-main">{rep.activeDeals}</td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">{rep.closedDeals}</td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                'inline-block rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                                rep.isBanned
                                  ? 'bg-app1-danger/10 text-app1-danger'
                                  : rep.hasLoggedIn
                                    ? 'bg-app1-primary/10 text-app1-primary'
                                    : 'bg-app1-secondary/15 text-app1-secondary',
                              )}
                            >
                              {rep.isBanned ? 'Suspended' : rep.hasLoggedIn ? 'Active' : 'Invite pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-4">
                              {!rep.isBanned && !rep.hasLoggedIn ? (
                                <button
                                  type="button"
                                  disabled={resendInvite.isPending}
                                  onClick={() => {
                                    setResendingId(rep.id)
                                    resendInvite.mutate(rep.id)
                                  }}
                                  className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-secondary hover:underline disabled:opacity-50"
                                >
                                  {resendInvite.isPending && resendingId === rep.id ? 'Sending…' : 'Resend invite'}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                disabled={rep.activeDeals > 0}
                                title={
                                  rep.activeDeals > 0
                                    ? `Reassign their ${rep.activeDeals} active ${rep.activeDeals === 1 ? 'deal' : 'deals'} before deleting`
                                    : 'Delete title rep'
                                }
                                aria-label={`Delete ${rep.fullName}`}
                                onClick={() => setDeleting(rep)}
                                className="inline-flex items-center gap-1 font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-danger hover:underline disabled:cursor-not-allowed disabled:text-app1-text-muted disabled:no-underline"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleting ? <DeleteTitleRepDialog rep={deleting} onClose={() => setDeleting(null)} /> : null}
    </DashboardLayout>
  )
}
