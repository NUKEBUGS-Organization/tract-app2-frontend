import { Link } from 'react-router-dom'
import { Plus, AlertTriangle, Loader2, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useMyListings } from '@/hooks/useListings'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    className: 'bg-theme-surface-2 text-theme-muted',
  },
  pending_review: {
    label: 'Pending Review',
    className: 'bg-amber-50 text-amber-700',
  },
  live: {
    label: 'Live',
    className: 'bg-tract-green-light text-tract-green',
  },
  under_contract: {
    label: 'Under Contract',
    className: 'bg-tract-gold/10 text-tract-gold',
  },
  closed: {
    label: 'Closed',
    className: 'bg-theme-surface-2 text-theme-muted',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-tract-red-light text-tract-red',
  },
} as const

export default function ListingsPage() {
  const { data: listings = [], isLoading, isError } = useMyListings()

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
        <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-theme-border bg-theme-topbar px-6 md:px-12 lg:flex">
          <h2 className="font-playfair text-[22px] font-bold text-theme-text">My Listings</h2>
          <Link
            to="/wholesaler/listings/new"
            className="inline-flex items-center gap-2 bg-tract-gold px-5 py-2 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600 active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New Listing
          </Link>
        </header>

        <div className="mx-auto max-w-[1440px] p-6 md:p-12">
          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-[12px] border border-tract-red/20 bg-tract-red-light p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-tract-red" />
              <p className="font-inter text-tract-red">Failed to load listings. Please refresh.</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && listings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="mb-4 h-16 w-16 text-gray-200" strokeWidth={1} />
              <h3 className="mb-2 font-playfair text-[24px] font-bold text-theme-text">No listings yet</h3>
              <p className="mb-8 max-w-xs font-inter text-theme-muted">
                Create your first listing to start receiving bids from verified buyers.
              </p>
              <Link
                to="/wholesaler/listings/new"
                className="inline-flex items-center gap-2 bg-tract-gold px-8 py-3 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
                Create First Listing
              </Link>
            </div>
          )}

          {/* Listings table */}
          {!isLoading && !isError && listings.length > 0 && (
            <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-surface-2">
                    {['Property', 'Deal Type', 'ARV', 'Proj. Profit', 'Bids', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted',
                          h === 'Actions' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
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
                      <tr key={listing.id} className="transition-colors hover:bg-theme-surface-2">
                        <td className="px-6 py-5">
                          <p className="font-inter text-[14px] font-bold text-theme-text">
                            {listing.propertyAddress || '—'}
                          </p>
                          <p className="mt-0.5 font-inter text-[12px] text-theme-muted">
                            {listing.city}
                            {listing.stateCode ? `, ${listing.stateCode}` : ''}
                          </p>
                        </td>
                        <td className="px-6 py-5 font-inter text-[13px] text-theme-muted">{dealLabel}</td>
                        <td className="px-6 py-5 font-inter text-[13px] font-semibold text-theme-text">
                          {listing.arv ? formatCurrency(listing.arv) : '—'}
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-inter text-[13px] font-bold text-tract-gold">
                            {listing.projectedBuyerProfit ? formatCurrency(listing.projectedBuyerProfit) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-inter text-[13px] text-theme-muted">{listing.bidCount ?? 0} / 10</td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider',
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
                                className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                              >
                                Edit
                              </Link>
                            )}
                            {listing.status === 'live' && (
                              <Link
                                to={`/wholesaler/listings/${listing.id}`}
                                className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-green hover:underline"
                              >
                                View Bids
                              </Link>
                            )}
                            {listing.status === 'under_contract' && (
                              <Link
                                to={`/wholesaler/listings/${listing.id}`}
                                className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-text hover:underline"
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
    </DashboardLayout>
  )
}
