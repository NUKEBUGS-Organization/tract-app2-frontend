import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleUser,
  ExternalLink,
  Gavel,
  Handshake,
  HelpCircle,
  History,
  Info,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Plus,
  Sparkles,
  Star,
  Store,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE, DEFAULT_PROPERTY_IMAGE } from '@/lib/placeholders'
import { cn, formatCurrency } from '@/lib/utils'

const HEADER_AVATAR = DEFAULT_AVATAR_IMAGE

const ACTIVE_BIDS = [
  {
    id: 'b1',
    property: '4821 Maple Dr',
    amount: 45_000,
    status: 'ACTIVE' as const,
    submitted: '2 days ago',
    action: 'view' as const,
  },
  {
    id: 'b2',
    property: '902 River Bend',
    amount: 67_500,
    status: 'WORKING' as const,
    submitted: '5 days ago',
    action: 'view' as const,
    workingNote: true,
  },
  {
    id: 'b3',
    property: '1240 Oak Ave',
    amount: 38_000,
    status: 'PRIMARY' as const,
    submitted: '1 day ago',
    action: 'deal' as const,
  },
]

const VIEWED_LISTINGS = [
  {
    id: 'v1',
    image: DEFAULT_PROPERTY_IMAGE,
    badge: 'NEW LISTING' as const,
    title: '772 N Highland St',
    subtitle: 'Atlanta, GA • Off-Market',
    profit: 52_400,
    cta: 'bid' as const,
    listingId: 'v1',
  },
  {
    id: 'v2',
    image: DEFAULT_PROPERTY_IMAGE,
    badge: 'BID PLACED' as const,
    title: '2201 Westview Ter',
    subtitle: 'Orlando, FL • Multi-Family',
    profit: 41_200,
    cta: 'details' as const,
    listingId: 'v2',
  },
  {
    id: 'v3',
    image: DEFAULT_PROPERTY_IMAGE,
    badge: 'PENDING' as const,
    title: '884 Lakeside Dr',
    subtitle: 'Charlotte, NC • SFR',
    profit: 68_900,
    cta: 'bid' as const,
    listingId: 'v3',
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const firstName = user?.fullName?.trim().split(/\s+/)[0] ?? 'Jordan'

  const onSignOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const navItem = (
    to: string | null,
    label: string,
    icon: typeof LayoutDashboard,
    active?: boolean,
    onClick?: () => void,
  ) => {
    const Icon = icon
    const content = (
      <>
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="font-inter text-[12px] font-bold uppercase tracking-wider">{label}</span>
      </>
    )
    const className = cn(
      'flex items-center gap-3 rounded-r-lg px-3 py-2.5 transition-all duration-200',
      active
        ? 'border-l-4 border-tract-gold bg-tract-gold/10 font-bold text-tract-gold'
        : 'border-l-4 border-transparent font-medium text-white/60 hover:bg-white/10 hover:text-white',
    )
    if (onClick) {
      return (
        <button key={label} type="button" onClick={onClick} className={cn('w-full text-left', className)}>
          {content}
        </button>
      )
    }
    if (!to) {
      return (
        <button
          key={label}
          type="button"
          className={cn('w-full cursor-default text-left', className)}
          aria-disabled
        >
          {content}
        </button>
      )
    }
    return (
      <Link key={to + label} to={to} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-tract-alabaster font-inter text-tract-obsidian">
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-tract-green/20 bg-tract-green py-8 md:flex">
        <div className="mb-10 px-6">
          <Link to="/buyer/dashboard" className="flex items-center gap-2 font-playfair text-[24px] font-bold text-white">
            <Sparkles className="h-6 w-6" strokeWidth={1.75} aria-hidden />
            TRACT Pro
          </Link>
          <p className="mt-1 font-inter text-[12px] font-bold uppercase tracking-wider text-white/50">
            Institutional grade
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
          {navItem('/buyer/dashboard', 'Dashboard', LayoutDashboard, true)}
          {navItem('/buyer/marketplace', 'Browse marketplace', Store)}
          {navItem(null, 'My bids', Gavel)}
          {navItem(null, 'Active deals', Handshake)}
          {navItem(null, 'Transaction history', History)}
          {navItem(null, 'Profile & score', CircleUser)}
        </nav>
        <div className="mt-auto space-y-1 px-2">
          <button
            type="button"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-tract-gold py-2.5 font-inter text-sm font-semibold text-[#3c2f00] transition-opacity hover:opacity-90"
          >
            <BadgeCheck className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
            Upgrade to Platinum
          </button>
          {navItem(null, 'Support', HelpCircle)}
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-r-lg border-l-4 border-transparent px-3 py-2.5 font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="font-inter text-[12px] font-bold uppercase tracking-wider">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="h-screen flex-1 overflow-y-auto bg-tract-alabaster">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-4 backdrop-blur md:px-12">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="truncate font-playfair text-xl font-bold text-tract-obsidian">Welcome back, {firstName}.</h1>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] px-2 py-1 font-inter text-[10px] font-bold uppercase tracking-wide text-[#3c2f00]">
              <BadgeCheck className="h-3 w-3" strokeWidth={2} aria-hidden />
              Vetted buyer
            </span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <button
              type="button"
              className="relative rounded p-1 text-gray-400 transition-colors hover:text-tract-gold"
              aria-label="Notifications"
            >
              <Bell className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-tract-red" aria-hidden />
            </button>
            <div className="flex cursor-pointer items-center gap-2">
              <img src={HEADER_AVATAR} alt="" className="h-10 w-10 rounded-full border border-gray-200 object-cover" />
              <ChevronDown className="hidden h-5 w-5 text-gray-500 sm:block" strokeWidth={2} aria-hidden />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-10 md:px-12">
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                { label: 'Active bids', value: '3', valueClass: 'text-tract-gold' },
                { label: 'Deals in progress', value: '1', valueClass: 'text-tract-obsidian' },
                {
                  label: 'Deals closed',
                  value: '7',
                  valueClass: 'text-tract-green',
                  icon: CheckCircle2,
                },
                { label: 'Success rate', value: '91%', valueClass: 'text-tract-gold' },
              ] as const
            ).map((card) => {
              const StatIcon = 'icon' in card ? card.icon : undefined
              return (
                <div
                  key={card.label}
                  className="rounded-lg border border-gray-100 bg-white p-6 transition-all hover:scale-[1.02] hover:border-tract-gold/50"
                >
                  <p className="mb-3 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">{card.label}</p>
                  <div className="flex items-center gap-2">
                    <p className={cn('font-playfair text-[32px] font-bold', card.valueClass)}>{card.value}</p>
                    {StatIcon ? <StatIcon className="h-6 w-6 text-tract-green" strokeWidth={2} aria-hidden /> : null}
                  </div>
                </div>
              )
            })}
          </section>

          <section className="group relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl border border-tract-gold/40 bg-white p-8 md:flex-row">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-tract-gold/5 to-transparent" aria-hidden />
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-tract-gold" strokeWidth={2} aria-hidden />
                <span className="font-inter text-[12px] font-bold uppercase tracking-widest text-tract-gold">
                  Under contract — action required
                </span>
              </div>
              <h2 className="font-playfair text-2xl font-bold text-tract-obsidian">4821 Maple Dr, Indianapolis, IN</h2>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="flex items-center gap-1 font-inter text-sm text-gray-500">
                  <ListOrdered className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                  Current pipeline:
                </span>
                <span className="rounded border border-tract-gold/20 bg-gray-100 px-2 py-1 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold">
                  Signing contract
                </span>
              </div>
            </div>
            <Link
              to="/deals/under-contract-demo/sign"
              className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-tract-gold px-6 py-3 font-inter text-sm font-semibold text-[#3c2f00] transition-all hover:opacity-90 md:group-hover:scale-105"
            >
              View deal tracker
              <ArrowRight className="h-5 w-5" strokeWidth={2} aria-hidden />
            </Link>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-playfair text-xl font-bold text-tract-obsidian">My active bids</h3>
              <Link
                to="/buyer/marketplace"
                className="flex items-center gap-1 font-inter text-sm font-semibold text-tract-gold hover:underline"
              >
                View all
                <ExternalLink className="h-4 w-4" strokeWidth={2} aria-hidden />
              </Link>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Property', 'Bid amount', 'Status', 'Submitted', 'Action'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'p-4 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500',
                            h === 'Action' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ACTIVE_BIDS.map((row) => (
                      <tr key={row.id} className="transition-colors hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-inter text-base font-semibold text-tract-obsidian">{row.property}</div>
                        </td>
                        <td className="p-4 font-inter text-sm font-semibold tracking-wide text-tract-obsidian">
                          {row.status === 'PRIMARY' ? (
                            <span className="text-tract-gold">{formatCurrency(row.amount)}</span>
                          ) : (
                            formatCurrency(row.amount)
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {row.status === 'ACTIVE' ? (
                              <span className="rounded bg-tract-green-light px-2 py-0.5 font-inter text-[10px] font-bold text-tract-green">
                                ACTIVE
                              </span>
                            ) : null}
                            {row.status === 'WORKING' ? (
                              <>
                                <span className="rounded bg-gray-100 px-2 py-0.5 font-inter text-[10px] font-bold text-gray-600">
                                  WORKING
                                </span>
                                <div className="group/tooltip relative">
                                  <Info className="h-4 w-4 cursor-help text-gray-500" strokeWidth={2} aria-hidden />
                                  <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded border border-gray-700 bg-tract-obsidian p-2 text-[11px] text-gray-200 opacity-0 shadow-xl transition-opacity group-hover/tooltip:opacity-100">
                                    Working bids are active but not yet selected by the wholesaler.
                                  </div>
                                </div>
                              </>
                            ) : null}
                            {row.status === 'PRIMARY' ? (
                              <span className="inline-flex w-fit items-center gap-1 rounded bg-tract-gold px-2 py-0.5 font-inter text-[10px] font-bold text-[#554300]">
                                <Star className="h-2.5 w-2.5 fill-current" strokeWidth={0} aria-hidden />
                                PRIMARY
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="p-4 font-inter text-sm text-gray-500">{row.submitted}</td>
                        <td className="p-4 text-right">
                          {row.action === 'deal' ? (
                            <Link
                              to="/deals/under-contract-demo/sign"
                              className="inline-block rounded bg-tract-gold px-3 py-1.5 font-inter text-sm font-semibold text-[#3c2f00] shadow-lg shadow-tract-gold/10 transition-opacity hover:opacity-90"
                            >
                              View deal
                            </Link>
                          ) : (
                            <Link
                              to="/buyer/listings/mkt-1"
                              className="inline-block rounded border border-tract-gold/30 px-3 py-1.5 font-inter text-sm font-semibold text-tract-gold transition-colors hover:bg-tract-gold hover:text-[#3c2f00]"
                            >
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-playfair text-xl font-bold text-tract-obsidian">Properties you viewed</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {VIEWED_LISTINGS.map((listing) => (
                <div
                  key={listing.id}
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-32 overflow-hidden bg-gray-100">
                    <img
                      src={listing.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className={cn(
                        'absolute right-2 top-2 rounded px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wider',
                        listing.badge === 'NEW LISTING' && 'bg-black/70 text-tract-gold backdrop-blur-sm',
                        listing.badge === 'BID PLACED' && 'bg-tract-green text-white',
                        listing.badge === 'PENDING' && 'bg-black/70 text-gray-400 backdrop-blur-sm',
                      )}
                    >
                      {listing.badge === 'NEW LISTING' ? 'New listing' : listing.badge === 'BID PLACED' ? 'Bid placed' : 'Pending'}
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <div>
                      <h4 className="font-inter text-base font-bold text-tract-obsidian">{listing.title}</h4>
                      <p className="text-[12px] text-gray-500">{listing.subtitle}</p>
                    </div>
                    <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                      <div>
                        <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-gray-500">Est. profit</p>
                        <p className="font-playfair text-xl font-bold text-tract-gold">{formatCurrency(listing.profit)}</p>
                      </div>
                      {listing.cta === 'bid' ? (
                        <Link
                          to={`/buyer/listings/${listing.listingId}`}
                          className="rounded bg-tract-gold px-3 py-2 font-inter text-[12px] font-semibold text-[#3c2f00] transition-colors hover:bg-yellow-500"
                        >
                          Place bid
                        </Link>
                      ) : (
                        <Link
                          to={`/buyer/listings/${listing.listingId}`}
                          className="rounded border border-tract-gold/30 px-3 py-2 font-inter text-[12px] font-semibold text-tract-gold transition-colors hover:bg-tract-gold/10"
                        >
                          View details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Link
        to="/buyer/marketplace"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-tract-gold text-[#3c2f00] shadow-2xl transition-transform hover:scale-105 md:hidden"
        aria-label="Browse marketplace"
      >
        <Plus className="h-7 w-7" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  )
}
