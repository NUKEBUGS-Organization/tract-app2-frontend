import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, AlertTriangle, Gavel } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useMyListings } from '@/hooks/useListings'
import api from '@/lib/api'
import { cn, formatCurrency } from '@/lib/utils'

const BID_STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-blue-50 text-blue-600' },
  primary: { label: 'Primary ★', className: 'bg-app1-secondary/10 text-app1-secondary' },
  backup_2: { label: 'Backup #2', className: 'bg-app1-primary/10 text-app1-primary' },
  backup_3: { label: 'Backup #3', className: 'bg-app1-primary/10 text-app1-primary' },
  working: { label: 'Working', className: 'bg-app1-bg-soft text-app1-text-muted' },
  rejected: { label: 'Rejected', className: 'bg-app1-danger/10 text-app1-danger' },
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
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <header className="sticky top-0 z-40 hidden h-16 items-center border-b border-app1-border-light bg-app1-bg-card px-6 md:px-12 lg:flex">
          <h2 className="font-cinzel text-[22px] font-black text-app1-primary">My Bids</h2>
        </header>

        <div className="mx-auto max-w-[1440px] p-6 md:p-12">

          <div className="mb-6 lg:hidden">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Wholesaler Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-2xl font-black text-app1-primary">
              My Bids
            </h1>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {isError && (
            <div className="rounded-app1-card border border-app1-danger/20 bg-app1-danger/5 p-8 text-center shadow-app1-card">
              <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-app1-danger" />
              <p className="font-poppins text-app1-danger">Failed to load bids. Please refresh.</p>
            </div>
          )}

          {!isLoading && !isError && bids.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center shadow-app1-card">
              <Gavel className="mb-4 h-16 w-16 text-app1-border-light" strokeWidth={1} />
              <p className="mb-8 max-w-md font-poppins text-[15px] text-app1-text-muted">
                No bids received yet on your listings.
              </p>
            </div>
          )}

          {!isLoading && !isError && bids.length > 0 && (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                    {['Listing', 'Bid Price', 'Status', 'Submitted', 'Action'].map((h) => (
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
                  {bids.map((bid) => {
                    const cfg =
                      BID_STATUS_CONFIG[bid.status as keyof typeof BID_STATUS_CONFIG] ?? BID_STATUS_CONFIG.active

                    const routeListingId = listingIdForRoute(bid)
                    const listingLabelText = listingLabel(bid, addressById)
                    const submitted = bid.createdAt ?? bid.submittedAt

                    return (
                      <tr key={bid._id ?? bid.id} className="transition-colors hover:bg-app1-bg-soft/60">
                        <td className="px-6 py-5">
                          <p className="font-poppins text-[13px] font-black text-app1-primary">{listingLabelText}</p>
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
                              cfg.className,
                            )}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-poppins text-[13px] text-app1-text-muted">
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
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline"
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
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
