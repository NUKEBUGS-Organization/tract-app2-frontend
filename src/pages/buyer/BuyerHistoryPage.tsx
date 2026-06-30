import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Gavel,
  Handshake,
  History,
  Loader2,
  XCircle,
} from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import StatCard from '@/components/app1/StatCard'
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
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Buyer Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
              Transaction History
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app1-text-muted">
              A full record of every bid you've placed and every deal you've closed.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {!isLoading && (
            <>
              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                <StatCard
                  label="Total Bids"
                  value={totalBids}
                  note="All time"
                  icon={Gavel}
                  tone="neutral"
                />
                <StatCard
                  label="Active Deals"
                  value={totalActive}
                  note="In progress"
                  icon={Handshake}
                  tone="primary"
                />
                <StatCard
                  label="Deals Closed"
                  value={totalClosed}
                  note="Successfully funded"
                  icon={CheckCircle2}
                  tone="primary"
                />
                <StatCard
                  label="Bids Rejected"
                  value={rejectedBids}
                  note="Not selected"
                  icon={XCircle}
                  tone="danger"
                />
              </div>

              {totalBids === 0 && totalClosed === 0 && (
                <div className="flex flex-col items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center shadow-app1-card">
                  <History className="h-16 w-16 text-app1-border-light" strokeWidth={1} />
                  <h3 className="font-cinzel text-[24px] font-black text-app1-primary">No activity yet</h3>
                  <p className="max-w-xs font-poppins text-app1-text-muted">
                    Your transaction history will appear here after you place bids and close deals.
                  </p>
                  <Link
                    to="/buyer/marketplace"
                    className="bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-primary-dark transition-all hover:scale-[1.02]"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              )}

              {closedDeals.length > 0 && (
                <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
                  <div className="border-b border-app1-border-light px-6 py-5">
                    <h2 className="font-cinzel text-xl font-black text-app1-primary">Closed Deals</h2>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                        {['Property', 'Status', 'Action'].map((h) => (
                          <th
                            key={h}
                            className={cn(
                              'px-6 py-4 font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted',
                              h === 'Action' && 'text-right',
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app1-border-light">
                      {closedDeals.map((deal) => {
                        const listing =
                          deal.listingId && typeof deal.listingId === 'object'
                            ? (deal.listingId as { propertyAddress?: string })
                            : null
                        return (
                          <tr key={deal.id} className="transition-colors hover:bg-app1-bg-soft/60">
                            <td className="px-6 py-5 font-poppins text-[14px] font-black text-app1-primary">
                              {listing?.propertyAddress ?? '—'}
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-block rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[11px] font-black uppercase tracking-wide text-app1-primary">
                                Closed ✓
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <Link
                                to={`/deals/${deal.id}`}
                                className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline"
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
                </div>
              )}

              {bids.length > 0 && (
                <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
                  <div className="border-b border-app1-border-light px-6 py-5">
                    <h2 className="font-cinzel text-xl font-black text-app1-primary">All Bids</h2>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                        {['Property', 'Bid Price', 'Status', 'Date'].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app1-border-light">
                      {bids.map((bid: Record<string, unknown>) => {
                        const listing = bid.listingId
                        const address =
                          typeof listing === 'object' && listing
                            ? (listing as { propertyAddress?: string }).propertyAddress
                            : '—'
                        const status = String(bid.status ?? '')
                        return (
                          <tr key={String(bid._id ?? bid.id)} className="transition-colors hover:bg-app1-bg-soft/60">
                            <td className="px-6 py-5 font-poppins text-[14px] font-black text-app1-primary">
                              {address || '—'}
                            </td>
                            <td className="px-6 py-5 font-poppins text-[14px] font-black text-app1-secondary">
                              {formatCurrency(Number(bid.assignmentPrice ?? 0))}
                            </td>
                            <td className="px-6 py-5">
                              <span
                                className={cn(
                                  'inline-block rounded-full px-3 py-1 font-poppins text-[11px] font-black uppercase tracking-wide',
                                  status === 'rejected'
                                    ? 'bg-app1-danger/10 text-app1-danger'
                                    : status === 'primary'
                                      ? 'bg-app1-secondary/10 text-app1-secondary'
                                      : 'bg-app1-bg-soft text-app1-text-muted',
                                )}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-poppins text-[12px] text-app1-text-muted">
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
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
