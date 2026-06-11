import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Handshake, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import TopBar from '@/components/layout/TopBar'
import { useMyDeals } from '@/hooks/useDeal'
import { cn } from '@/lib/utils'
import type { MarketplaceDeal } from '@/types'

const STEP_LABELS: Record<string, string> = {
  contract_signed: 'Contract Signed',
  emd_deposited: 'EMD Deposited',
  inspection_period: 'Inspection Phase',
  appraisal_ordered: 'Appraisal Ordered',
  financing_approved: 'Financing Approved',
  title_search_complete: 'Title Search',
  clear_to_close: 'Clear to Close',
  funded_closed: 'Funded & Closed',
}

const STEP_ORDER = [
  'contract_signed',
  'emd_deposited',
  'inspection_period',
  'appraisal_ordered',
  'financing_approved',
  'title_search_complete',
  'clear_to_close',
  'funded_closed',
]

function listingFromDeal(deal: MarketplaceDeal) {
  const listing = deal.listingId
  if (listing && typeof listing === 'object') {
    return listing as { propertyAddress?: string; city?: string; stateCode?: string }
  }
  return null
}

export default function WholesalerDealsPage() {
  const { data: deals = [], isLoading, isError, refetch } = useMyDeals()

  const activeDeals = deals.filter((d) => d.currentStep !== 'funded_closed')
  const closedDeals = deals.filter((d) => d.currentStep === 'funded_closed')

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="Deal Tracker" />
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-tract-red" />
              <p className="font-inter text-theme-muted">Failed to load deals.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-inter text-sm font-bold uppercase tracking-wider text-tract-gold hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && deals.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Handshake className="h-16 w-16 text-gray-200" strokeWidth={1} />
              <h3 className="font-playfair text-[24px] font-bold text-theme-text">No active deals</h3>
              <p className="max-w-xs font-inter text-theme-muted">Deals appear here after a buyer selects your listing.</p>
              <Link
                to="/wholesaler/listings"
                className="bg-tract-gold px-8 py-3 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600"
              >
                My Listings
              </Link>
            </div>
          )}

          {activeDeals.length > 0 && (
            <div>
              <h2 className="mb-4 font-playfair text-[24px] font-bold text-theme-text">Active Deals</h2>
              <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-theme-border bg-theme-surface-2">
                      {['Property', 'Buyer', 'Step', 'Progress', 'Action'].map((h) => (
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
                    {activeDeals.map((deal) => {
                      const listing = listingFromDeal(deal)
                      const buyer = deal.primaryBuyer
                      const stepIdx = STEP_ORDER.indexOf(deal.currentStep)
                      const pct = Math.round(((stepIdx + 1) / STEP_ORDER.length) * 100)
                      return (
                        <tr key={deal.id} className="transition-colors hover:bg-theme-surface-2">
                          <td className="px-6 py-5">
                            <p className="font-inter text-[14px] font-bold text-theme-text">{listing?.propertyAddress ?? '—'}</p>
                            <p className="mt-0.5 font-inter text-[12px] text-theme-muted">
                              {listing?.city ?? ''}
                              {listing?.stateCode ? `, ${listing.stateCode}` : ''}
                            </p>
                          </td>
                          <td className="px-6 py-5 font-inter text-[13px] text-theme-muted">{buyer?.fullName ?? 'Buyer'}</td>
                          <td className="px-6 py-5">
                            <span className="rounded-full bg-tract-green-light px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider text-tract-green">
                              {STEP_LABELS[deal.currentStep] ?? deal.currentStep}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                                <div className="h-full rounded-full bg-tract-green" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-inter text-[11px] text-theme-muted">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
                            >
                              Track
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

          {closedDeals.length > 0 && (
            <div>
              <h2 className="mb-4 font-playfair text-[24px] font-bold text-theme-text">Closed Deals</h2>
              <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-theme-border bg-theme-surface-2">
                      {['Property', 'Buyer', 'Status', 'Action'].map((h) => (
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
                      const listing = listingFromDeal(deal)
                      const buyer = deal.primaryBuyer
                      return (
                        <tr key={deal.id} className="hover:bg-theme-surface-2">
                          <td className="px-6 py-5 font-inter text-[14px] font-bold text-theme-text">
                            {listing?.propertyAddress ?? '—'}
                          </td>
                          <td className="px-6 py-5 font-inter text-[13px] text-theme-muted">{buyer?.fullName ?? 'Buyer'}</td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-tract-green-light px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider text-tract-green">
                              <CheckCircle2 className="h-3 w-3" />
                              Closed
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-inter text-[12px] font-bold uppercase tracking-wider text-theme-muted hover:underline"
                            >
                              View
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
        </div>
      </div>
    </DashboardLayout>
  )
}
