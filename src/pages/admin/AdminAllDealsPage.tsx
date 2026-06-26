import { Loader2, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import TopBar from '@/components/layout/TopBar'
import { useQuery } from '@tanstack/react-query'
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

export default function AdminAllDealsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'all-deals'],
    queryFn: async () => {
      const { data } = await api.get('/deals')
      return data.data
    },
  })

  const deals = Array.isArray(data) ? data : []

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="All Deals" />
        <div className="mx-auto max-w-[1440px] p-6 md:p-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-tract-red" />
              <p className="font-inter text-theme-muted">Failed to load deals.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-inter text-sm font-bold uppercase tracking-wider text-tract-gold hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-surface-2">
                    {['Property', 'Buyer', 'Wholesaler', 'Step', 'Action'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted',
                          h === 'Action' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center font-inter text-theme-muted">
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
                      return (
                        <tr key={dealId} className="transition-colors hover:bg-theme-surface-2">
                          <td className="px-6 py-4 font-inter text-[14px] font-bold text-theme-text">
                            {String(listing?.propertyAddress ?? '—')}
                          </td>
                          <td className="px-6 py-4 font-inter text-[13px] text-theme-muted">
                            {typeof buyer === 'object' ? String(buyer?.fullName ?? '—') : '—'}
                          </td>
                          <td className="px-6 py-4 font-inter text-[13px] text-theme-muted">
                            {typeof wholesaler === 'object' ? String(wholesaler?.fullName ?? '—') : '—'}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block rounded-full bg-tract-green-light px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider text-tract-green">
                              {STEP_LABELS[currentStep] ?? currentStep}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/deals/${dealId}`}
                              className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
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
    </DashboardLayout>
  )
}
