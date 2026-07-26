import { ExternalLink, Gavel } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

export type App1BidSummary = {
  sourceApp: 'app1'
  bidId: string
  listingId: string
  listingAddress: string
  bidPrice: number
  status: string
  submittedAt: string
  role: 'wholesaler' | 'realtor'
}

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-blue-50 text-blue-600',
  selected: 'bg-app1-secondary/10 text-app1-secondary',
  backup: 'bg-app1-primary/10 text-app1-primary',
  rejected: 'bg-app1-danger/10 text-app1-danger',
}

const APP1_LISTING_BASE = 'https://seller.tractcorp.com/properties'

type Props = {
  bids: App1BidSummary[]
}

export default function SellerTractBidsSection({ bids }: Props) {
  if (!bids.length) return null

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-cinzel text-2xl font-black text-app1-primary">Seller Tract Bids</h3>
        <p className="mt-1 text-sm text-app1-text-muted">
          Your bids on Seller Tract (App 1). Open a card to view the listing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {bids.map((bid) => (
          <a
            key={bid.bidId}
            href={`${APP1_LISTING_BASE}/${bid.listingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-app1-card border border-app1-border-light bg-app1-bg-card p-5 shadow-app1-card transition-all duration-200 hover:-translate-y-0.5 hover:border-app1-secondary/40 hover:shadow-lg"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-app1-secondary" aria-hidden />
                <p className="font-poppins text-sm font-black text-app1-primary line-clamp-2">
                  {bid.listingAddress || '—'}
                </p>
              </div>
              <ExternalLink
                className="h-4 w-4 shrink-0 text-app1-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </div>

            <p className="font-poppins text-xl font-black text-app1-secondary">
              {formatCurrency(bid.bidPrice)}
            </p>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-block rounded-full px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em]',
                  STATUS_STYLE[bid.status] ?? 'bg-app1-bg-soft text-app1-text-muted',
                )}
              >
                {bid.status}
              </span>
              <span className="font-poppins text-[11px] text-app1-text-muted">
                {bid.submittedAt
                  ? new Date(bid.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
