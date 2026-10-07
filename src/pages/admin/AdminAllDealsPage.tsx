import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import { useAdminDeals } from '@/hooks/useAdminDeals'
import AssignTitleRepModal from '@/components/admin/AssignTitleRepModal'
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

function titleRepIdOf(deal: Record<string, unknown>): string | undefined {
  const ref = deal.titleRepId
  if (typeof ref === 'object' && ref !== null) return String((ref as { _id?: string })._id ?? '')
  return typeof ref === 'string' ? ref : undefined
}

export default function AdminAllDealsPage() {
  const [reassignDeal, setReassignDeal] = useState<{
    dealId: string
    propertyLine: string
    currentRepId: string | undefined
    currentName: string | undefined
  } | null>(null)

  const { data, isLoading, isError, refetch } = useAdminDeals()

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
                              {deal.titleHandling === 'tract' ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-poppins text-[13px] text-app1-text-muted">
                                    {repName || 'Unassigned'}
                                  </span>
                                  {currentStep !== 'funded_closed' ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReassignDeal({
                                          dealId,
                                          propertyLine: String(listing?.propertyAddress ?? ''),
                                          currentRepId: titleRepIdOf(deal),
                                          currentName: repName || undefined,
                                        })
                                      }
                                      className="shrink-0 font-poppins text-[11px] font-bold uppercase tracking-wider text-app1-secondary hover:underline"
                                    >
                                      {repName ? 'Change' : 'Assign'}
                                    </button>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="font-poppins text-[13px] text-app1-text-muted">
                                  {deal.titleHandling === 'own_rep' ? 'Buyer’s own rep' : '—'}
                                </span>
                              )}
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
        <AssignTitleRepModal
          dealId={reassignDeal.dealId}
          propertyLine={reassignDeal.propertyLine}
          currentRepId={reassignDeal.currentRepId}
          currentName={reassignDeal.currentName}
          onClose={() => setReassignDeal(null)}
        />
      )}
    </DashboardLayout>
  )
}
