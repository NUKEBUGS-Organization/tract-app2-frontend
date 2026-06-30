import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Handshake, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
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
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Wholesaler Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
              Deal Tracker
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app1-text-muted">
              Monitor every active assignment and closed transaction.
            </p>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-app1-danger" />
              <p className="font-poppins text-app1-text-muted">Failed to load deals.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && deals.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center shadow-app1-card">
              <Handshake className="h-16 w-16 text-app1-border-light" strokeWidth={1} />
              <h3 className="font-cinzel text-[24px] font-black text-app1-primary">No active deals</h3>
              <p className="max-w-xs font-poppins text-app1-text-muted">Deals appear here after a buyer selects your listing.</p>
              <Link
                to="/wholesaler/listings"
                className="bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-primary-dark transition-all hover:scale-[1.02]"
              >
                My Listings
              </Link>
            </div>
          )}

          {activeDeals.length > 0 && (
            <div>
              <h2 className="mb-4 font-cinzel text-2xl font-black text-app1-primary">Active Deals</h2>
              <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                      {['Property', 'Buyer', 'Step', 'Progress', 'Action'].map((h) => (
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
                    {activeDeals.map((deal) => {
                      const listing = listingFromDeal(deal)
                      const buyer = deal.primaryBuyer
                      const stepIdx = STEP_ORDER.indexOf(deal.currentStep)
                      const pct = Math.round(((stepIdx + 1) / STEP_ORDER.length) * 100)
                      return (
                        <tr key={deal.id} className="transition-colors hover:bg-app1-bg-soft/60">
                          <td className="px-6 py-5">
                            <p className="font-poppins text-[14px] font-black text-app1-primary">{listing?.propertyAddress ?? '—'}</p>
                            <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                              {listing?.city ?? ''}
                              {listing?.stateCode ? `, ${listing.stateCode}` : ''}
                            </p>
                          </td>
                          <td className="px-6 py-5 font-poppins text-[13px] text-app1-text-muted">{buyer?.fullName ?? 'Buyer'}</td>
                          <td className="px-6 py-5">
                            <span className="rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                              {STEP_LABELS[deal.currentStep] ?? deal.currentStep}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-app1-border-light">
                                <div className="h-full rounded-full bg-app1-primary" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-poppins text-[11px] text-app1-text-muted">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline"
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
            </div>
          )}

          {closedDeals.length > 0 && (
            <div>
              <h2 className="mb-4 font-cinzel text-2xl font-black text-app1-primary">Closed Deals</h2>
              <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                      {['Property', 'Buyer', 'Status', 'Action'].map((h) => (
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
                      const listing = listingFromDeal(deal)
                      const buyer = deal.primaryBuyer
                      return (
                        <tr key={deal.id} className="hover:bg-app1-bg-soft/60">
                          <td className="px-6 py-5 font-poppins text-[14px] font-black text-app1-primary">
                            {listing?.propertyAddress ?? '—'}
                          </td>
                          <td className="px-6 py-5 font-poppins text-[13px] text-app1-text-muted">{buyer?.fullName ?? 'Buyer'}</td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                              <CheckCircle2 className="h-3 w-3" />
                              Closed
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-muted hover:underline"
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
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
