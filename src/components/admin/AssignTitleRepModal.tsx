import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAdminTitleReps, useAssignTitleRep } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

interface AssignTitleRepModalProps {
  dealId: string
  propertyLine?: string
  currentRepId?: string
  currentName?: string
  onClose: () => void
}

/** Admin picks the TRACT title rep for a deal where the buyer chose Admin as title representative. */
export default function AssignTitleRepModal({
  dealId,
  propertyLine,
  currentRepId,
  currentName,
  onClose,
}: AssignTitleRepModalProps) {
  const { data: titleReps = [], isLoading } = useAdminTitleReps()
  const assign = useAssignTitleRep()
  const [selected, setSelected] = useState('')
  const available = titleReps.filter((rep) => !rep.isBanned)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-title-rep-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div className="w-full max-w-[480px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-xl">
        <h3 id="assign-title-rep-heading" className="mb-1 font-cinzel text-[22px] font-bold text-app1-text-main">
          {currentName ? 'Reassign Title Rep' : 'Assign Title Rep'}
        </h3>
        {propertyLine ? (
          <p className="font-poppins text-[13px] font-bold text-app1-text-main">{propertyLine}</p>
        ) : null}
        <p className="mb-6 font-poppins text-[13px] text-app1-text-muted">
          Current: <span className="font-bold text-app1-text-main">{currentName ?? 'Unassigned'}</span>. The rep is
          emailed the full deal details and can see the deal right away.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-app1-secondary" />
          </div>
        ) : available.length === 0 ? (
          <p className="py-4 text-center font-poppins text-[13px] text-app1-text-muted">
            No title reps yet.{' '}
            <Link to="/admin/title-reps" className="font-bold text-app1-secondary hover:underline">
              Add one
            </Link>
            .
          </p>
        ) : (
          <div className="mb-6 max-h-[300px] space-y-2 overflow-y-auto">
            {available.map((rep) => {
              const isCurrent = rep.id === currentRepId
              return (
                <button
                  key={rep.id}
                  type="button"
                  disabled={isCurrent}
                  onClick={() => setSelected(rep.id)}
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                    selected === rep.id
                      ? 'border-app1-secondary bg-app1-secondary/5'
                      : 'border-app1-border-light bg-app1-bg-soft hover:border-app1-secondary/50',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                        selected === rep.id ? 'border-app1-secondary' : 'border-app1-border-light',
                      )}
                    >
                      {selected === rep.id && <div className="h-2 w-2 rounded-full bg-app1-secondary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-poppins text-[14px] font-bold text-app1-text-main">
                        {rep.fullName}
                        {isCurrent ? <span className="ml-2 text-[11px] font-normal text-app1-text-muted">(current)</span> : null}
                      </p>
                      <p className="truncate font-poppins text-[12px] text-app1-text-muted">{rep.email}</p>
                    </div>
                    <span className="shrink-0 font-poppins text-[11px] text-app1-text-muted">
                      {rep.activeDeals} open {rep.activeDeals === 1 ? 'deal' : 'deals'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[8px] border border-app1-border-light py-2.5 font-poppins text-[13px] font-bold text-app1-text-muted transition-colors hover:bg-app1-bg-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected || assign.isPending}
            onClick={() => {
              if (!selected) return
              assign.mutate({ dealId, titleRepId: selected }, { onSuccess: onClose })
            }}
            className="flex-1 rounded-[8px] bg-app1-secondary py-2.5 font-poppins text-[13px] font-bold text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
          >
            {assign.isPending ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}
