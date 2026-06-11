import { Link } from 'react-router-dom'
import { History, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { useMyDeals } from '@/hooks/useDeal'
import { useMyBids } from '@/hooks/useListings'
import { cn, formatCurrency } from '@/lib/utils'

export default function BuyerHistoryPage() {
  const { data: deals = [], isLoading: dl } = useMyDeals()
  const { data: bids = [], isLoading: bl } = useMyBids()
  const isLoading = dl || bl

  const closedDeals = deals.filter((d) => d.currentStep === 'funded_closed')
  const totalBids = bids.length
  const totalClosed = closedDeals.length
  const totalActive = deals.filter((d) => d.currentStep !== 'funded_closed').length
  const rejectedBids = bids.filter((b: Record<string, unknown>) => b.status === 'rejected').length

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="Transaction History" />
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {!isLoading && (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: 'Total Bids', value: totalBids, color: 'text-tract-gold' },
                  { label: 'Active Deals', value: totalActive, color: 'text-tract-green' },
                  { label: 'Deals Closed', value: totalClosed, color: 'text-tract-green' },
                  { label: 'Bids Rejected', value: rejectedBids, color: 'text-tract-red' },
                ].map((s) => (
                  <div key={s.label} className="rounded-[12px] border border-theme-border bg-theme-card p-6 shadow-sm">
                    <p className="mb-2 font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">{s.label}</p>
                    <p className={cn('font-playfair text-[40px] font-bold leading-none', s.color)}>{s.value}</p>
                  </div>
                ))}
              </div>

              {totalBids === 0 && totalClosed === 0 && (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                  <History className="h-16 w-16 text-gray-200" strokeWidth={1} />
                  <h3 className="font-playfair text-[24px] font-bold text-theme-text">No activity yet</h3>
                  <p className="max-w-xs font-inter text-theme-muted">
                    Your transaction history will appear here after you place bids and close deals.
                  </p>
                  <Link
                    to="/buyer/marketplace"
                    className="bg-tract-gold px-8 py-3 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              )}

              {closedDeals.length > 0 && (
                <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
                  <div className="border-b border-theme-border px-6 py-5">
                    <h2 className="font-playfair text-[20px] font-bold text-theme-text">Closed Deals</h2>
                  </div>
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-theme-border bg-theme-surface-2">
                        {['Property', 'Status', 'Action'].map((h) => (
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
                      {closedDeals.map((deal) => {
                        const listing =
                          deal.listingId && typeof deal.listingId === 'object'
                            ? (deal.listingId as { propertyAddress?: string })
                            : null
                        return (
                          <tr key={deal.id} className="transition-colors hover:bg-theme-surface-2">
                            <td className="px-6 py-5 font-inter text-[14px] font-bold text-theme-text">
                              {listing?.propertyAddress ?? '—'}
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-block rounded-full bg-tract-green-light px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider text-tract-green">
                                Closed ✓
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Link
                                to={`/deals/${deal.id}`}
                                className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                              >
                                View Deal
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {bids.length > 0 && (
                <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
                  <div className="border-b border-theme-border px-6 py-5">
                    <h2 className="font-playfair text-[20px] font-bold text-theme-text">All Bids</h2>
                  </div>
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-theme-border bg-theme-surface-2">
                        {['Property', 'Bid Price', 'Status', 'Date'].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                      {bids.map((bid: Record<string, unknown>) => {
                        const listing = bid.listingId
                        const address =
                          typeof listing === 'object' && listing
                            ? (listing as { propertyAddress?: string }).propertyAddress
                            : '—'
                        const status = String(bid.status ?? '')
                        return (
                          <tr key={String(bid._id ?? bid.id)} className="transition-colors hover:bg-theme-surface-2">
                            <td className="px-6 py-5 font-inter text-[14px] font-bold text-theme-text">
                              {address || '—'}
                            </td>
                            <td className="px-6 py-5 font-inter text-[14px] font-bold text-tract-gold">
                              {formatCurrency(Number(bid.assignmentPrice ?? 0))}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={cn(
                                  'inline-block rounded-full px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider',
                                  status === 'rejected'
                                    ? 'bg-tract-red-light text-tract-red'
                                    : status === 'primary'
                                      ? 'bg-tract-gold/10 text-tract-gold'
                                      : 'bg-theme-surface-2 text-theme-muted',
                                )}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-inter text-[12px] text-theme-muted">
                              {bid.createdAt
                                ? new Date(String(bid.createdAt)).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
