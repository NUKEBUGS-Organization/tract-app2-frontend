import { Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import TopBar from '@/components/layout/TopBar'
import { useAdminDashboard, useReviewListing } from '@/hooks/useAdmin'
import { cn } from '@/lib/utils'

export default function AdminPendingListingsPage() {
  const { data, isLoading } = useAdminDashboard()
  const reviewListing = useReviewListing()
  const listings = data?.pendingListings ?? []

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="Pending Listings" />
        <div className="mx-auto max-w-[1440px] p-6 md:p-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {!isLoading && (
            <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-surface-2">
                    {['Property', 'Wholesaler', 'Submitted', 'Flag', 'Action'].map((h) => (
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
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center font-inter text-theme-muted">
                        No listings pending review.
                      </td>
                    </tr>
                  ) : (
                    listings.map((l) => (
                      <tr key={l.id} className="transition-colors hover:bg-theme-surface-2">
                        <td className="px-6 py-4 font-inter text-[14px] font-bold text-theme-text">
                          {l.propertyAddress}
                          {l.city ? `, ${l.city}` : ''}
                        </td>
                        <td className="px-6 py-4 font-inter text-[13px] text-theme-muted">
                          {l.wholesalerName}
                        </td>
                        <td className="px-6 py-4 font-inter text-[12px] text-theme-muted">
                          {l.submittedAt}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'rounded px-2 py-1 font-inter text-sm',
                              l.outlierFlagged
                                ? 'border border-amber-700/20 bg-amber-50 font-bold text-amber-800'
                                : 'bg-theme-surface-2 text-theme-muted',
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
                            className="rounded bg-tract-green px-3 py-1 font-inter text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
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
                            className="rounded bg-tract-red px-3 py-1 font-inter text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
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
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
