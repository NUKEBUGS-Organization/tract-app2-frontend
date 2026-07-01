import { Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import PageHeader from '@/components/app1/PageHeader'
import { useAdminDashboard, useReviewListing } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

export default function AdminPendingListingsPage() {
  const { data, isLoading } = useAdminDashboard()
  const reviewListing = useReviewListing()
  const listings = data?.pendingListings ?? []

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <div className="min-h-screen">
        <div className="mx-auto max-w-[1440px] p-6 md:p-10 space-y-6">
          <PageHeader eyebrow="Admin Workspace" title="Pending Listings" />

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {!isLoading && (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                    {['Property', 'Wholesaler', 'Submitted', 'Flag', 'Action'].map((h) => (
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
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center font-poppins text-app1-text-muted">
                        No listings pending review.
                      </td>
                    </tr>
                  ) : (
                    listings.map((l) => (
                      <tr key={l.id} className="transition-colors hover:bg-app1-bg-soft">
                        <td className="px-6 py-4 font-poppins text-[14px] font-bold text-app1-text-main">
                          {l.propertyAddress}
                          {l.city ? `, ${l.city}` : ''}
                        </td>
                        <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                          {l.wholesalerName}
                        </td>
                        <td className="px-6 py-4 font-poppins text-[12px] text-app1-text-muted">
                          {l.submittedAt}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'rounded-full px-3 py-1 font-poppins text-xs',
                              l.outlierFlagged
                                ? 'border border-amber-700/20 bg-amber-50 font-bold text-amber-800'
                                : 'bg-app1-bg-soft text-app1-text-muted',
                            )}
                          >
                            {l.flagLabel}
                          </span>
                        </td>
                        <td className="space-x-2 px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={reviewListing.isPending}
                            onClick={() =>
                              reviewListing.mutate({
                                listingId: l.id,
                                action: 'approve',
                              })
                            }
                            className="rounded bg-app1-primary px-3 py-1 font-poppins text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={reviewListing.isPending}
                            onClick={() =>
                              reviewListing.mutate({
                                listingId: l.id,
                                action: 'reject',
                              })
                            }
                            className="rounded bg-app1-danger px-3 py-1 font-poppins text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                          >
                            Reject
                          </button>
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
    </DashboardLayout>
  )
}
