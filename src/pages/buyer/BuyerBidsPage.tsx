import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Gavel, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { useMyBids } from '@/hooks/useListings'
import { cn, formatCurrency } from '@/lib/utils'

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-blue-50 text-blue-600',
  primary: 'bg-tract-gold/10 text-tract-gold',
  backup_2: 'bg-tract-green-light text-tract-green',
  backup_3: 'bg-tract-green-light text-tract-green',
  working: 'bg-theme-surface-2 text-theme-muted',
  rejected: 'bg-tract-red-light text-tract-red',
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
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="My Bids" />
        <div className="mx-auto max-w-[1440px] p-6 md:p-10">
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
                  'rounded-full px-4 py-1.5 font-inter text-[12px] font-bold uppercase tracking-wider transition-colors',
                  filter === tab.id
                    ? 'bg-tract-gold text-white'
                    : 'border border-theme-border bg-theme-card text-theme-muted hover:bg-theme-surface-2',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-tract-red" />
              <p className="font-inter text-theme-muted">Failed to load bids.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-inter text-sm font-bold uppercase tracking-wider text-tract-gold hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Gavel className="h-16 w-16 text-gray-200" strokeWidth={1} />
              <h3 className="font-playfair text-[24px] font-bold text-theme-text">
                {filter === 'all' ? 'No bids placed yet' : `No ${filter} bids`}
              </h3>
              <p className="max-w-xs font-inter text-theme-muted">
                Browse the marketplace and place bids on available properties.
              </p>
              <Link
                to="/buyer/marketplace"
                className="bg-tract-gold px-8 py-3 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600"
              >
                Browse Marketplace
              </Link>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-surface-2">
                    {['Property', 'Bid Price', 'Status', 'Submitted', 'Action'].map((h) => (
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
                      <tr key={bidId} className="transition-colors hover:bg-theme-surface-2">
                        <td className="px-6 py-5">
                          <p className="font-inter text-[14px] font-bold text-theme-text">{address || 'Property'}</p>
                          {city ? (
                            <p className="mt-0.5 font-inter text-[12px] text-theme-muted">
                              {city}
                              {state ? `, ${state}` : ''}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-inter text-[14px] font-bold text-tract-gold">
                            {formatCurrency(Number(bid.assignmentPrice ?? 0))}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              'inline-block rounded-full px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider',
                              STATUS_STYLE[status] ?? 'bg-theme-surface-2 text-theme-muted',
                            )}
                          >
                            {STATUS_LABEL[status] ?? status}
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
                        <td className="px-6 py-5 text-right">
                          {listingId ? (
                            <Link
                              to={`/buyer/listings/${listingId}`}
                              className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
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
