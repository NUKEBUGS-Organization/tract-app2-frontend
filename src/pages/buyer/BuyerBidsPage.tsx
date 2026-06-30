import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Gavel, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useMyBids } from '@/hooks/useListings'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-blue-50 text-blue-600',
  primary: 'bg-app1-secondary/10 text-app1-secondary',
  backup_2: 'bg-app1-primary/10 text-app1-primary',
  backup_3: 'bg-app1-primary/10 text-app1-primary',
  working: 'bg-app1-bg-soft text-app1-text-muted',
  rejected: 'bg-app1-danger/10 text-app1-danger',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  primary: 'Under Contract ★',
  backup_2: 'Backup #2',
  backup_3: 'Backup #3',
  working: 'Working',
  rejected: 'Rejected',
}

export default function BuyerBidsPage() {
  const { data: bids = [], isLoading, isError, refetch } = useMyBids()
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all')

  const filtered = bids.filter((bid: Record<string, unknown>) => {
    const status = String(bid.status ?? '')
    if (filter === 'active') {
      return ['active', 'primary', 'backup_2', 'backup_3'].includes(status)
    }
    if (filter === 'closed') {
      return ['working', 'rejected'].includes(status)
    }
    return true
  })

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] p-6 md:p-10">

          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Buyer Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
              My Bids
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app1-text-muted">
              Track every offer you've submitted across the marketplace.
            </p>
          </div>

          <div className="mb-6 flex gap-2">
            {(
              [
                { id: 'all', label: 'All Bids' },
                { id: 'active', label: 'Active' },
                { id: 'closed', label: 'Closed' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  'rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
                  filter === tab.id
                    ? 'bg-app1-secondary text-app1-primary-dark'
                    : 'border border-app1-border-light bg-app1-bg-card text-app1-text-muted hover:bg-app1-bg-soft',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-app1-danger" />
              <p className="font-poppins text-app1-text-muted">Failed to load bids.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center shadow-app1-card">
              <Gavel className="h-16 w-16 text-app1-border-light" strokeWidth={1} />
              <h3 className="font-cinzel text-[24px] font-black text-app1-primary">
                {filter === 'all' ? 'No bids placed yet' : `No ${filter} bids`}
              </h3>
              <p className="max-w-xs font-poppins text-app1-text-muted">
                Browse the marketplace and place bids on available properties.
              </p>
              <Link
                to="/buyer/marketplace"
                className="bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-primary-dark transition-all hover:scale-[1.02]"
              >
                Browse Marketplace
              </Link>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                    {['Property', 'Bid Price', 'Status', 'Submitted', 'Action'].map((h) => (
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
                  {filtered.map((bid: Record<string, unknown>) => {
                    const listing = bid.listingId
                    const address = typeof listing === 'object' && listing ? (listing as { propertyAddress?: string }).propertyAddress : '—'
                    const city = typeof listing === 'object' && listing ? (listing as { city?: string }).city : ''
                    const state = typeof listing === 'object' && listing ? (listing as { stateCode?: string }).stateCode : ''
                    const listingId =
                      typeof listing === 'object' && listing
                        ? String((listing as { id?: string; _id?: string }).id ?? (listing as { _id?: string })._id ?? '')
                        : String(listing ?? '')
                    const bidId = String(bid._id ?? bid.id ?? '')
                    const status = String(bid.status ?? '')
                    return (
                      <tr key={bidId} className="transition-colors hover:bg-app1-bg-soft/60">
                        <td className="px-6 py-5">
                          <p className="font-poppins text-[14px] font-black text-app1-primary">{address || 'Property'}</p>
                          {city ? (
                            <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                              {city}
                              {state ? `, ${state}` : ''}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-poppins text-[14px] font-black text-app1-secondary">
                            {formatCurrency(Number(bid.assignmentPrice ?? 0))}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                              STATUS_STYLE[status] ?? 'bg-app1-bg-soft text-app1-text-muted',
                            )}
                          >
                            {STATUS_LABEL[status] ?? status}
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
                        <td className="px-6 py-5 text-right">
                          {listingId ? (
                            <Link
                              to={`/buyer/listings/${listingId}`}
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline"
                            >
                              View Listing
                            </Link>
                          ) : null}
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
