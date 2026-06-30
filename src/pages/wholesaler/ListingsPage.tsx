import { Link } from 'react-router-dom'
import { Plus, AlertTriangle, Loader2, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useMyListings } from '@/hooks/useListings'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    className: 'bg-app1-bg-soft text-app1-text-muted',
  },
  pending_review: {
    label: 'Pending Review',
    className: 'bg-amber-50 text-amber-700',
  },
  live: {
    label: 'Live',
    className: 'bg-app1-primary/10 text-app1-primary',
  },
  under_contract: {
    label: 'Under Contract',
    className: 'bg-app1-secondary/10 text-app1-secondary',
  },
  closed: {
    label: 'Closed',
    className: 'bg-app1-bg-soft text-app1-text-muted',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-app1-danger/10 text-app1-danger',
  },
} as const

export default function ListingsPage() {
  const { data: listings = [], isLoading, isError } = useMyListings()

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-app1-border-light bg-app1-bg-card px-6 md:px-12 lg:flex">
          <h2 className="font-cinzel text-[22px] font-black text-app1-primary">My Listings</h2>
          <Link
            to="/wholesaler/listings/new"
            className="inline-flex items-center gap-2 bg-app1-secondary px-5 py-2.5 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-app1-premium transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Listing
          </Link>
        </header>

        <div className="mx-auto max-w-[1440px] p-6 md:p-12">

          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
                Wholesaler Workspace
              </p>
              <h1 className="mt-1 font-cinzel text-2xl font-black text-app1-primary">
                My Listings
              </h1>
            </div>
            <Link
              to="/wholesaler/listings/new"
              className="inline-flex shrink-0 items-center gap-2 bg-app1-secondary px-4 py-2.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              New
            </Link>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {isError && (
            <div className="rounded-app1-card border border-app1-danger/20 bg-app1-danger/5 p-8 text-center shadow-app1-card">
              <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-app1-danger" />
              <p className="font-poppins text-app1-danger">Failed to load listings. Please refresh.</p>
            </div>
          )}

          {!isLoading && !isError && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center shadow-app1-card">
              <FileText className="mb-4 h-16 w-16 text-app1-border-light" strokeWidth={1} />
              <h3 className="mb-2 font-cinzel text-[24px] font-black text-app1-primary">No listings yet</h3>
              <p className="mb-8 max-w-xs font-poppins text-app1-text-muted">
                Create your first listing to start receiving bids from verified buyers.
              </p>
              <Link
                to="/wholesaler/listings/new"
                className="inline-flex items-center gap-2 bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Create First Listing
              </Link>
            </div>
          )}

          {!isLoading && !isError && listings.length > 0 && (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                    {['Property', 'Deal Type', 'ARV', 'Proj. Profit', 'Bids', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted',
                          h === 'Actions' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-app1-border-light">
                  {listings.map((listing) => {
                    const cfg =
                      STATUS_CONFIG[listing.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft

                    const dealLabel =
                      {
                        fix_flip: 'Fix & Flip',
                        hold_sell: 'Hold & Sell',
                        full_gut: 'Full Gut',
                        new_construction: 'New Construction',
                      }[listing.dealType as string] ?? listing.dealType

                    return (
                      <tr key={listing.id} className="transition-colors hover:bg-app1-bg-soft/60">
                        <td className="px-6 py-5">
                          <p className="font-poppins text-[14px] font-black text-app1-primary">
                            {listing.propertyAddress || '—'}
                          </p>
                          <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                            {listing.city}
                            {listing.stateCode ? `, ${listing.stateCode}` : ''}
                          </p>
                        </td>
                        <td className="px-6 py-5 font-poppins text-[13px] text-app1-text-muted">{dealLabel}</td>
                        <td className="px-6 py-5 font-poppins text-[13px] font-bold text-app1-text-main">
                          {listing.arv ? formatCurrency(listing.arv) : '—'}
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-poppins text-[13px] font-black text-app1-secondary">
                            {listing.projectedBuyerProfit ? formatCurrency(listing.projectedBuyerProfit) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-poppins text-[13px] text-app1-text-muted">{listing.bidCount ?? 0} / 10</td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                              cfg.className,
                            )}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {listing.status === 'draft' && (
                              <Link
                                to={`/wholesaler/listings/new?from=${listing.id}`}
                                className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline"
                              >
                                Edit
                              </Link>
                            )}
                            {listing.status === 'live' && (
                              <Link
                                to={`/wholesaler/listings/${listing.id}`}
                                className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary hover:underline"
                              >
                                View Bids
                              </Link>
                            )}
                            {listing.status === 'under_contract' && (
                              <Link
                                to={`/wholesaler/listings/${listing.id}`}
                                className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-main hover:underline"
                              >
                                View Deal
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
