import { useQuery, useMutation } from '@tanstack/react-query'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Hammer,
  Images,
  LayoutDashboard,
  Loader2,
  Map,
  Search,
  Settings,
  Upload,
  Wallet,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DRAFT_LISTING_MOCK } from '@/lib/data/draftListingMock'
import { fetchDraftListing } from '@/lib/data/wholesalerListing'
import { cn, formatCurrency } from '@/lib/utils'

const CHECKLIST_ITEMS = [
  { key: 'arv', label: 'ARV & Comps Upload', icon: Upload },
  { key: 'rehab', label: 'Rehab Cost Estimate', icon: Hammer },
  { key: 'deal', label: 'Deal Type & Assignment Fee', icon: DollarSign },
  { key: 'media', label: 'Media Vault (Photos + Video)', icon: Images },
] as const

export default function DraftListingDetailPage() {
  const { listingId } = useParams<{ listingId: string }>()
  const navigate = useNavigate()
  const id = listingId ?? 'draft'

  const { data, isLoading } = useQuery({
    queryKey: ['wholesaler', 'listing', 'draft', id],
    queryFn: () => fetchDraftListing(id),
  })

  const listing = data ?? { ...DRAFT_LISTING_MOCK, id }

  const progressPct =
    listing.checklistTotal > 0
      ? Math.round((100 * listing.checklistCompleted) / listing.checklistTotal)
      : 0

  const startIntakeMutation = useMutation({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 400))
    },
    onSuccess: () => {
      navigate(`/wholesaler/listings/new?from=${encodeURIComponent(listing.id)}`)
    },
  })

  return (
    <div className="flex min-h-screen flex-col bg-tract-alabaster font-inter text-tract-obsidian">
      <header className="sticky top-0 z-50 mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-gray-100 bg-white px-5 py-4 md:px-12">
        <div className="flex items-center gap-10">
          <Link to="/wholesaler/dashboard" className="font-playfair text-[24px] font-bold tracking-tight text-tract-green">
            TRACT
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/buyer/marketplace" className="border-b-2 border-tract-gold pb-1 font-inter text-base text-tract-gold">
              Listings
            </Link>
            <a href="#" className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold">
              Portfolio
            </a>
            <a href="#" className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold">
              Insights
            </a>
            <a href="#" className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold">
              Contact
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden
            />
            <label htmlFor="marketplace-search" className="sr-only">
              Search marketplace
            </label>
            <input
              id="marketplace-search"
              type="search"
              placeholder="Search marketplace..."
              className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 font-inter text-sm text-tract-obsidian placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-tract-gold"
            />
          </div>
          <Link
            to="/buyer/marketplace"
            className="rounded-lg bg-tract-gold px-6 py-2 font-inter text-sm font-semibold text-[#554300] transition-transform active:scale-95"
          >
            Invest Now
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px] flex-1">
        <aside className="hidden w-[280px] flex-col gap-2 border-r border-gray-100 bg-gray-50 py-10 pl-6 pr-4 md:flex">
          <div className="mb-6 flex flex-col gap-1">
            <span className="mb-2 px-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
              Management
            </span>
            <Link
              to={`/wholesaler/listings/${listing.id}`}
              className="flex items-center gap-3 rounded-lg bg-gray-100 p-3 font-inter text-base text-tract-gold"
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Inventory
            </Link>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg p-3 font-inter text-base text-gray-500 transition-colors hover:bg-gray-100"
            >
              <Wallet className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Transactions
            </a>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg p-3 font-inter text-base text-gray-500 transition-colors hover:bg-gray-100"
            >
              <BarChart3 className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Performance
            </a>
          </div>
          <div className="mt-auto flex flex-col gap-1">
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg p-3 font-inter text-base text-gray-500 transition-colors hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Settings
            </a>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-tract-alabaster">
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-tract-green" aria-label="Loading listing" />
            </div>
          ) : (
            <div className="mx-auto max-w-[900px] space-y-6 p-6 md:p-12">
              {listing.syncedFromApp1 ? (
                <section className="flex flex-col items-start justify-between gap-4 rounded-lg border border-tract-orange bg-tract-orange/10 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 shrink-0 text-tract-orange" strokeWidth={2} aria-hidden />
                    <p className="font-inter text-sm text-tract-obsidian">
                      This property was synced from App 1. Complete all required fields to publish to the
                      marketplace.
                    </p>
                  </div>
                  <a
                    href="#checklist"
                    className="whitespace-nowrap font-inter text-sm font-semibold text-tract-gold hover:underline"
                  >
                    Complete Now →
                  </a>
                </section>
              ) : null}

              <section id="checklist" className="rounded-xl border border-black/5 bg-white p-8 shadow-sm">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-tract-green-light px-4 py-1.5 text-tract-green">
                    <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                    <span className="font-inter text-[12px] font-bold uppercase tracking-wider">
                      Contract Secured
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-tract-green" strokeWidth={2} aria-hidden />
                    <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                      {listing.sellerLabel}
                    </span>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 items-end gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h1 className="font-playfair text-[24px] font-bold text-tract-obsidian">
                      {listing.address}, {listing.cityStateZip}
                    </h1>
                    <span className="inline-block rounded bg-[#191C1F] px-2 py-1 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-400">
                      {listing.propertyType}
                    </span>
                  </div>
                  <div className="md:text-right">
                    <p className="mb-1 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                      Purchase Price
                    </p>
                    <p className="font-playfair text-[24px] font-bold text-tract-obsidian">
                      {formatCurrency(listing.purchasePrice)}
                    </p>
                  </div>
                </div>

                <div className="mb-6 h-px w-full bg-tract-graphite/10" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                      Fields Required Before Publishing
                    </span>
                    <span className="font-inter text-sm text-gray-500">
                      {listing.checklistCompleted} of {listing.checklistTotal} completed
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-tract-green transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <ul className="space-y-4">
                    {CHECKLIST_ITEMS.map(({ key, label, icon: Icon }) => (
                      <li
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-black/5 bg-tract-alabaster/80 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6 shrink-0 text-gray-500" strokeWidth={1.75} aria-hidden />
                          <span className="font-inter text-base text-tract-obsidian">{label}</span>
                        </div>
                        <span className="rounded bg-[#323538] px-2 py-1 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-300">
                          Required
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={startIntakeMutation.isPending}
                    aria-busy={startIntakeMutation.isPending}
                    onClick={() => startIntakeMutation.mutate()}
                    className={cn(
                      'flex h-14 w-full items-center justify-center gap-3 rounded-lg font-inter text-sm font-bold uppercase tracking-[0.15em] text-white shadow-md transition-all active:scale-[0.98]',
                      'bg-tract-gold shadow-tract-gold/20 hover:bg-yellow-600',
                    )}
                  >
                    {startIntakeMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Starting…
                      </>
                    ) : (
                      <>
                        Start Intake Form
                        <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </>
                    )}
                  </button>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="group relative aspect-video overflow-hidden rounded-xl bg-[#272A2E]">
                  <img
                    src={listing.heroImageUrl}
                    alt="Property exterior"
                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-6">
                    <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-white">
                      Property Exterior Preview
                    </span>
                  </div>
                </div>
                <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#1D2023] p-2">
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 text-gray-500">
                    <Map className="h-12 w-12" strokeWidth={1.25} aria-hidden />
                    <p className="text-center font-inter text-sm">Map View Restricted until published</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      <footer className="border-t border-white/10 bg-[#191C1F]">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-5 py-10 md:flex-row md:px-12">
          <div>
            <span className="font-playfair text-[20px] font-bold text-tract-gold">TRACT</span>
            <p className="mt-2 font-inter text-sm text-gray-400">© 2024 TRACT Private Marketplace. All rights reserved.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Legal Notices', 'Regulatory Disclosure'].map((label) => (
              <a key={label} href="#" className="font-inter text-sm text-gray-400 transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
