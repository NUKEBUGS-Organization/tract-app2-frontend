import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Handshake, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useMyDeals } from '@/hooks/useDeal'
import { DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
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
    return listing as { propertyAddress?: string; city?: string; stateCode?: string; photoUrls?: string[] }
  }
  return null
}

export default function BuyerDealsPage() {
  const { data: deals = [], isLoading, isError, refetch } = useMyDeals()

  const activeDeals = deals.filter((d) => d.currentStep !== 'funded_closed')
  const closedDeals = deals.filter((d) => d.currentStep === 'funded_closed')

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">

          <div className="mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
              Buyer Workspace
            </p>
            <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
              My Deals
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-app1-text-muted">
              Track every active and closed transaction.
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
              <p className="max-w-xs font-poppins text-app1-text-muted">Place a bid and get selected to start your first deal.</p>
              <Link
                to="/buyer/marketplace"
                className="bg-app1-secondary px-8 py-3 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-primary-dark transition-all hover:scale-[1.02]"
              >
                Browse Marketplace
              </Link>
            </div>
          )}

          {activeDeals.length > 0 && (
            <div>
              <h2 className="mb-4 font-cinzel text-2xl font-black text-app1-primary">In Progress</h2>
              <div className="space-y-4">
                {activeDeals.map((deal) => {
                  const listing = listingFromDeal(deal)
                  const stepIdx = STEP_ORDER.indexOf(deal.currentStep)
                  const pct = Math.round(((stepIdx + 1) / STEP_ORDER.length) * 100)
                  return (
                    <div
                      key={deal.id}
                      className="flex flex-wrap items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:flex-nowrap"
                    >
                      <img
                        src={listing?.photoUrls?.[0] ?? DEFAULT_PROPERTY_IMAGE}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-poppins text-[14px] font-black text-app1-primary">
                          {listing?.propertyAddress ?? '—'}
                        </p>
                        <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                          {listing?.city ?? ''}
                          {listing?.stateCode ? `, ${listing.stateCode}` : ''}
                          {deal.wholesaler?.fullName ? ` · with ${deal.wholesaler.fullName}` : ''}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-app1-border-light">
                            <div className="h-full rounded-full bg-app1-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="shrink-0 font-poppins text-[11px] text-app1-text-muted">
                            Step {stepIdx + 1}/{STEP_ORDER.length}
                          </span>
                        </div>
                        <p className="mt-1 font-poppins text-[12px] font-bold text-app1-primary">
                          {STEP_LABELS[deal.currentStep] ?? deal.currentStep}
                        </p>
                      </div>
                      <Link
                        to={`/deals/${deal.id}`}
                        className="flex shrink-0 items-center gap-1 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary hover:underline"
                      >
                        Track Deal
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {closedDeals.length > 0 && (
            <div>
              <h2 className="mb-4 font-cinzel text-2xl font-black text-app1-primary">Closed Deals</h2>
              <div className="space-y-4">
                {closedDeals.map((deal) => {
                  const listing = listingFromDeal(deal)
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 opacity-75 shadow-app1-card"
                    >
                      <img
                        src={listing?.photoUrls?.[0] ?? DEFAULT_PROPERTY_IMAGE}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded-xl object-cover grayscale"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-poppins text-[14px] font-black text-app1-primary">
                          {listing?.propertyAddress ?? '—'}
                        </p>
                        <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                          {listing?.city ?? ''}
                          {listing?.stateCode ? `, ${listing.stateCode}` : ''}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-app1-primary" strokeWidth={1.75} />
                          <span className="font-poppins text-[12px] font-bold text-app1-primary">Funded & Closed</span>
                        </div>
                      </div>
                      <Link
                        to={`/deals/${deal.id}`}
                        className="shrink-0 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-muted hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
