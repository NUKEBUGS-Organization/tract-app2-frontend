import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Loader2, ShieldQuestion } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import {
  useAdvanceTitleRequest,
  useTitleRepRequests,
  type TitleRepRequest,
} from '@/hooks/useTitleRepRequests'
import { cn } from '@/lib/utils'

const STEP_LABELS: Record<string, string> = {
  contract_signed: 'Contract Signed',
  emd_deposited: 'EMD Deposited',
  inspection_period: 'Inspection Phase',
  appraisal_ordered: 'Appraisal Ordered',
  financing_approved: 'Financing Approved',
  title_search_complete: 'Title Search',
  clear_to_close: 'Clear to Close',
  funded_closed: 'Funded & Closed',
}

function stepLabel(step: string | null | undefined): string {
  if (!step) return '—'
  return STEP_LABELS[step] ?? step
}

function propertyLine(request: TitleRepRequest): string {
  const listing = request.listingId
  return (
    [listing?.propertyAddress, listing?.city, listing?.stateCode].filter(Boolean).join(', ') || '—'
  )
}

function StatusBadge({ request }: { request: TitleRepRequest }) {
  if (request.disputeFrozen) {
    return (
      <span className="inline-block rounded-full bg-app1-danger/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-danger">
        Frozen
      </span>
    )
  }
  if (request.buyerFailed) {
    return (
      <span className="inline-block rounded-full bg-app1-danger/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-danger">
        Buyer failed
      </span>
    )
  }
  if (request.awaitingAdmin) {
    return (
      <span className="inline-block rounded-full bg-app1-secondary/15 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-secondary">
        Needs you
      </span>
    )
  }
  if (!request.nextStep) {
    return (
      <span className="inline-block rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
        Closed
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full bg-app1-bg-soft px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-text-muted">
      With buyer
    </span>
  )
}

export default function AdminTitleRequestsPage() {
  const { data, isLoading, isError, refetch } = useTitleRepRequests()
  const advance = useAdvanceTitleRequest()
  const [pendingDealId, setPendingDealId] = useState<string | null>(null)

  const requests = useMemo(() => (Array.isArray(data) ? data : []), [data])
  const awaitingCount = requests.filter((request) => request.awaitingAdmin).length

  return (
    <DashboardLayout
      sidebar={<AdminSidebar />}
      className="bg-app1-bg-main font-poppins text-app1-text-main"
    >
      <div className="min-h-screen">
        <div className="mx-auto max-w-[1440px] space-y-6 p-6 md:p-10">
          <PageHeader eyebrow="Admin Workspace" title="Title Representative Requests" />

          <p className="max-w-[820px] font-poppins text-[13px] text-app1-text-muted">
            Deals where the buyer chose TRACT as their title representative. From title search
            onward you are the only party who can advance these, so anything marked
            <span className="font-bold text-app1-text-main"> Needs you </span>
            is waiting on an admin.
            {awaitingCount > 0 ? (
              <span className="font-bold text-app1-text-main">
                {' '}
                {awaitingCount} waiting now.
              </span>
            ) : null}
          </p>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-app1-danger" />
              <p className="font-poppins text-app1-text-muted">
                Failed to load title representative requests.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-poppins text-sm font-bold uppercase tracking-wider text-app1-secondary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                      {['Property', 'Buyer', 'Lister', 'Current Step', 'Status', 'Action'].map(
                        (heading) => (
                          <th
                            key={heading}
                            className={cn(
                              'px-6 py-4 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-text-muted',
                              heading === 'Action' && 'text-right',
                            )}
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app1-border-light">
                    {requests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-16 text-center font-poppins text-app1-text-muted"
                        >
                          <ShieldQuestion className="mx-auto mb-3 h-8 w-8 text-app1-text-muted/60" />
                          No buyer has selected TRACT as their title representative yet.
                        </td>
                      </tr>
                    ) : (
                      requests.map((request) => {
                        const dealId = String(request.id ?? request._id ?? '')
                        const isPending = advance.isPending && pendingDealId === dealId
                        return (
                          <tr key={dealId} className="transition-colors hover:bg-app1-bg-soft">
                            <td className="px-6 py-4 font-poppins text-[14px] font-bold text-app1-text-main">
                              {propertyLine(request)}
                            </td>
                            <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                              {request.primaryBuyerId?.fullName ?? '—'}
                            </td>
                            <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                              {request.wholesalerId?.fullName ?? '—'}
                            </td>
                            <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                              {stepLabel(request.currentStep)}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge request={request} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-4">
                                {request.awaitingAdmin && request.nextStep ? (
                                  <button
                                    type="button"
                                    disabled={advance.isPending}
                                    onClick={() => {
                                      setPendingDealId(dealId)
                                      advance.mutate({
                                        dealId,
                                        step: String(request.nextStep),
                                      })
                                    }}
                                    className="rounded-[8px] bg-app1-secondary px-4 py-2 font-poppins text-[12px] font-bold text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
                                  >
                                    {isPending
                                      ? 'Advancing...'
                                      : `Advance to ${stepLabel(request.nextStep)}`}
                                  </button>
                                ) : null}
                                <Link
                                  to={`/deals/${dealId}`}
                                  className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-secondary hover:underline"
                                >
                                  View
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
