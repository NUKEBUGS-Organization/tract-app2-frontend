import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { useReassignTitleRep, useAdminTitleReps } from '@/hooks/useAdmin'
import api from '@/lib/api'
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

function titleRepName(deal: Record<string, unknown>): string | undefined {
  const titleRep = deal.titleRep as { fullName?: string } | undefined
  const titleRepId = deal.titleRepId
  if (typeof titleRepId === 'object' && titleRepId !== null) {
    return String((titleRepId as { fullName?: string }).fullName ?? '')
  }
  return (deal.titleRepName as string | undefined) ?? titleRep?.fullName
}

function ReassignModal({
  dealId,
  currentName,
  onClose,
}: {
  dealId: string
  currentName: string | undefined
  onClose: () => void
}) {
  const { data: titleReps = [] } = useAdminTitleReps()
  const reassign = useReassignTitleRep()
  const [selected, setSelected] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[480px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-xl">
        <h3 className="font-cinzel text-[22px] font-bold text-app1-text-main mb-1">Reassign Title Rep</h3>
        <p className="font-poppins text-[13px] text-app1-text-muted mb-6">
          Current:{' '}
          <span className="font-bold text-app1-text-main">{currentName ?? 'Unassigned'}</span>
        </p>

        {titleReps.length === 0 ? (
          <p className="font-poppins text-[13px] text-app1-text-muted py-4 text-center">
            No approved title reps available.
          </p>
        ) : (
          <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
            {titleReps.map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => setSelected(rep.id)}
                className={cn(
                  'w-full text-left p-4',
                  'rounded-xl border',
                  'transition-colors',
                  selected === rep.id
                    ? 'border-app1-secondary bg-app1-secondary/5'
                    : 'border-app1-border-light bg-app1-bg-soft hover:border-app1-secondary/50',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-2',
                      'flex items-center justify-center',
                      'shrink-0',
                      selected === rep.id ? 'border-app1-secondary' : 'border-app1-border-light',
                    )}
                  >
                    {selected === rep.id && (
                      <div className="h-2 w-2 rounded-full bg-app1-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="font-poppins text-[14px] font-bold text-app1-text-main">{rep.fullName}</p>
                    <p className="font-poppins text-[12px] text-app1-text-muted">{rep.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[8px] border border-app1-border-light py-2.5 font-poppins text-[13px] font-bold text-app1-text-muted hover:bg-app1-bg-soft transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected || reassign.isPending}
            onClick={() => {
              if (!selected) return
              reassign.mutate({ dealId, titleRepId: selected }, { onSuccess: onClose })
            }}
            className="flex-1 rounded-[8px] bg-app1-secondary py-2.5 font-poppins text-[13px] font-bold text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          >
            {reassign.isPending ? 'Reassigning...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminAllDealsPage() {
  const [reassignDeal, setReassignDeal] = useState<{
    dealId: string
    currentName: string | undefined
  } | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'all-deals'],
    queryFn: async () => {
      const { data } = await api.get('/deals')
      return data.data
    },
  })

  const deals = Array.isArray(data) ? data : []

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="min-h-screen">
        <div className="mx-auto max-w-[1440px] p-6 md:p-10 space-y-6">
          <PageHeader eyebrow="Admin Workspace" title="All Deals" />

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-app1-danger" />
              <p className="font-poppins text-app1-text-muted">Failed to load deals.</p>
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
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                      {['Property', 'Buyer', 'Wholesaler', 'Title Rep', 'Step', 'Action'].map((h) => (
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
                    {deals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center font-poppins text-app1-text-muted">
                          No deals found.
                        </td>
                      </tr>
                    ) : (
                      deals.map((deal: Record<string, unknown>) => {
                        const listing = deal.listingId as Record<string, unknown> | undefined
                        const buyer = deal.primaryBuyerId as Record<string, unknown> | undefined
                        const wholesaler = deal.wholesalerId as Record<string, unknown> | undefined
                        const dealId = String(deal.id ?? deal._id ?? '')
                        const currentStep = String(deal.currentStep ?? '')
                        const repName = titleRepName(deal)
                        return (
                          <tr key={dealId} className="transition-colors hover:bg-app1-bg-soft">
                            <td className="px-6 py-4 font-poppins text-[14px] font-bold text-app1-text-main">
                              {String(listing?.propertyAddress ?? '—')}
                            </td>
                            <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                              {typeof buyer === 'object' ? String(buyer?.fullName ?? '—') : '—'}
                            </td>
                            <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                              {(deal as { wholesalerName?: string }).wholesalerName ??
                                (typeof wholesaler === 'object' && wholesaler?.fullName != null
                                  ? String(wholesaler.fullName)
                                  : null) ??
                                '—'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-poppins text-[13px] text-app1-text-muted">
                                  {repName ?? '—'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReassignDeal({
                                      dealId,
                                      currentName: repName,
                                    })
                                  }
                                  className="font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-secondary hover:underline shrink-0"
                                >
                                  {repName ? 'Change' : 'Assign'}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-block rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                                {STEP_LABELS[currentStep] ?? currentStep}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                to={`/deals/${dealId}`}
                                className="font-poppins text-[12px] font-bold uppercase tracking-wider text-app1-secondary hover:underline"
                              >
                                View
                              </Link>
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

      {reassignDeal && (
        <ReassignModal
          dealId={reassignDeal.dealId}
          currentName={reassignDeal.currentName}
          onClose={() => setReassignDeal(null)}
        />
      )}
    </DashboardLayout>
  )
}
