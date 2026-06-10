import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, Handshake, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
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
      <div className="min-h-screen bg-tract-alabaster">
        <TopBar title="My Deals" />
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-tract-red" />
              <p className="font-inter text-gray-500">Failed to load deals.</p>
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
              <h3 className="font-playfair text-[24px] font-bold text-tract-obsidian">No active deals</h3>
              <p className="max-w-xs font-inter text-gray-500">Place a bid and get selected to start your first deal.</p>
              <Link
                to="/buyer/marketplace"
                className="bg-tract-gold px-8 py-3 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600"
              >
                Browse Marketplace
              </Link>
            </div>
          )}

          {activeDeals.length > 0 && (
            <div>
              <h2 className="mb-4 font-playfair text-[24px] font-bold text-tract-obsidian">In Progress</h2>
              <div className="space-y-4">
                {activeDeals.map((deal) => {
                  const listing = listingFromDeal(deal)
                  const stepIdx = STEP_ORDER.indexOf(deal.currentStep)
                  const pct = Math.round(((stepIdx + 1) / STEP_ORDER.length) * 100)
                  return (
                    <div
                      key={deal.id}
                      className="flex flex-wrap items-center gap-4 rounded-[12px] border border-gray-100 bg-white p-6 shadow-sm md:flex-nowrap"
                    >
                      <img
                        src={listing?.photoUrls?.[0] ?? DEFAULT_PROPERTY_IMAGE}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-inter text-[14px] font-bold text-tract-obsidian">
                          {listing?.propertyAddress ?? '—'}
                        </p>
                        <p className="mt-0.5 font-inter text-[12px] text-gray-400">
                          {listing?.city ?? ''}
                          {listing?.stateCode ? `, ${listing.stateCode}` : ''}
                          {deal.wholesaler?.fullName ? ` · with ${deal.wholesaler.fullName}` : ''}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                            <div className="h-full rounded-full bg-tract-green transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="shrink-0 font-inter text-[11px] text-gray-400">
                            Step {stepIdx + 1}/{STEP_ORDER.length}
                          </span>
                        </div>
                        <p className="mt-1 font-inter text-[12px] font-semibold text-tract-green">
                          {STEP_LABELS[deal.currentStep] ?? deal.currentStep}
                        </p>
                      </div>
                      <Link
                        to={`/deals/${deal.id}`}
                        className="flex shrink-0 items-center gap-1 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
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
              <h2 className="mb-4 font-playfair text-[24px] font-bold text-tract-obsidian">Closed Deals</h2>
              <div className="space-y-4">
                {closedDeals.map((deal) => {
                  const listing = listingFromDeal(deal)
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center gap-4 rounded-[12px] border border-gray-100 bg-white p-6 opacity-75 shadow-sm"
                    >
                      <img
                        src={listing?.photoUrls?.[0] ?? DEFAULT_PROPERTY_IMAGE}
                        alt=""
                        className="h-16 w-24 shrink-0 rounded object-cover grayscale"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-inter text-[14px] font-bold text-tract-obsidian">
                          {listing?.propertyAddress ?? '—'}
                        </p>
                        <p className="mt-0.5 font-inter text-[12px] text-gray-400">
                          {listing?.city ?? ''}
                          {listing?.stateCode ? `, ${listing.stateCode}` : ''}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-tract-green" strokeWidth={1.75} />
                          <span className="font-inter text-[12px] font-semibold text-tract-green">Funded & Closed</span>
                        </div>
                      </div>
                      <Link
                        to={`/deals/${deal.id}`}
                        className="shrink-0 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-400 hover:underline"
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
