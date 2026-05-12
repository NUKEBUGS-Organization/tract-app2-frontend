import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, AlertTriangle, Gavel } from 'lucide-react'
import { Link } from 'react-router-dom'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useMyListings } from '@/hooks/useListings'
import api from '@/lib/api'
import { cn, formatCurrency } from '@/lib/utils'

const BID_STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-blue-50 text-blue-600' },
  primary: { label: 'Primary ★', className: 'bg-tract-gold/10 text-tract-gold' },
  backup_2: { label: 'Backup #2', className: 'bg-tract-green-light text-tract-green' },
  backup_3: { label: 'Backup #3', className: 'bg-tract-green-light text-tract-green' },
  working: { label: 'Working', className: 'bg-gray-100 text-gray-500' },
  rejected: { label: 'Rejected', className: 'bg-tract-red-light text-tract-red' },
} as const

type BidRow = {
  _id?: string
  id?: string
  status?: string
  assignmentPrice?: number
  createdAt?: string
  submittedAt?: string
  listingId?: unknown
}

function listingIdForRoute(bid: BidRow): string {
  const lid = bid.listingId
  if (typeof lid === 'object' && lid !== null) {
    const o = lid as { id?: string; _id?: { toString(): string } | string }
    if (o.id) return o.id
    if (o._id != null) return typeof o._id === 'string' ? o._id : o._id.toString()
  }
  return lid != null ? String(lid) : ''
}

function listingLabel(bid: BidRow, addressById: Record<string, string>): string {
  const lid = bid.listingId
  if (typeof lid === 'object' && lid !== null && 'propertyAddress' in lid) {
    const addr = (lid as { propertyAddress?: string }).propertyAddress
    if (addr) return addr
  }
  const id = listingIdForRoute(bid)
  return addressById[id] || 'Property'
}

export default function BidsPage() {
  const { data: listings = [], isLoading: listingsLoading, isError: listingsError } = useMyListings()
  const listingIds = useMemo(
    () => listings.map((l) => l.id).filter((id): id is string => Boolean(id)),
    [listings],
  )
  const addressById = useMemo(() => {
    const m: Record<string, string> = {}
    for (const l of listings) {
      if (l.id) m[l.id] = l.propertyAddress ?? ''
    }
    return m
  }, [listings])

  const { data: allBids = [], isLoading: bidsLoading, isError: bidsError } = useQuery({
    queryKey: ['bids', 'wholesaler', listingIds],
    queryFn: async () => {
      if (listingIds.length === 0) return []
      const results = await Promise.all(
        listingIds.map((id) =>
          api
            .get(`/bids/listing/${id}`)
            .then((r) => (r.data as { data?: unknown }).data ?? [])
            .catch(() => []),
        ),
      )
      return results.flat() as BidRow[]
    },
    enabled: listingIds.length > 0,
    staleTime: 30_000,
  })

  const bids = allBids
  const isLoading = listingsLoading || (listingIds.length > 0 && bidsLoading)
  const isError = listingsError || bidsError

  return (
    <div className="flex min-h-screen bg-tract-alabaster font-inter text-tract-obsidian">
      <WholesalerSidebar />
      <main className="ml-[240px] min-h-screen flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center border-b border-gray-100 bg-white px-6 md:px-12">
          <h2 className="font-playfair text-[22px] font-bold text-tract-obsidian">My Bids</h2>
        </header>

        <div className="mx-auto max-w-[1440px] p-6 md:p-12">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {isError && (
            <div className="rounded-[12px] border border-tract-red/20 bg-tract-red-light p-8 text-center">
              <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-tract-red" />
              <p className="font-inter text-tract-red">Failed to load bids. Please refresh.</p>
            </div>
          )}

          {!isLoading && !isError && bids.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Gavel className="mb-4 h-16 w-16 text-gray-200" strokeWidth={1} />
              <h3 className="mb-2 font-playfair text-[24px] font-bold text-tract-obsidian">No bids yet</h3>
              <p className="mb-8 max-w-xs font-inter text-gray-500">No bids received yet on your listings.</p>
            </div>
          )}

          {!isLoading && !isError && bids.length > 0 && (
            <div className="overflow-hidden rounded-[12px] border border-gray-100 bg-white shadow-sm">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Listing', 'Bid Price', 'Status', 'Submitted', 'Action'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-inter text-[11px] font-bold uppercase tracking-wider text-gray-400',
                          h === 'Action' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bids.map((bid) => {
                    const cfg =
                      BID_STATUS_CONFIG[bid.status as keyof typeof BID_STATUS_CONFIG] ?? BID_STATUS_CONFIG.active

                    const routeListingId = listingIdForRoute(bid)
                    const listingLabelText = listingLabel(bid, addressById)
                    const submitted = bid.createdAt ?? bid.submittedAt

                    return (
                      <tr key={bid._id ?? bid.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-5">
                          <p className="font-inter text-[13px] font-bold text-tract-obsidian">{listingLabelText}</p>
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
                              cfg.className,
                            )}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-inter text-[13px] text-gray-400">
                          {submitted
                            ? new Date(submitted).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {routeListingId ? (
                            <Link
                              to={`/wholesaler/listings/${routeListingId}`}
                              className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                            >
                              View Bids
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
