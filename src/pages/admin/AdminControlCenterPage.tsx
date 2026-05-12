import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Users,
  FileText,
  Gavel,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import { cn, formatCurrency } from '@/lib/utils'
import { useAdminDashboard, useReviewListing } from '@/hooks/useAdmin'

export default function AdminControlCenterPage() {
  const user = useAuthStore((s) => s.user)
  const displayName = user?.fullName?.trim() || 'Administrator'

  const { data, isLoading, isError, refetch } = useAdminDashboard()
  const reviewListing = useReviewListing()

  if (isLoading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter text-tract-obsidian">
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter text-tract-obsidian">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-10 w-10 text-tract-red" />
          <p className="font-inter text-gray-500">Failed to load admin dashboard.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 font-inter text-sm font-bold uppercase tracking-wider text-tract-gold hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </main>
      </DashboardLayout>
    )
  }

  const stats = data?.stats
  const listings = data?.pendingListings ?? []
  const penalties = data?.recentPenalties ?? []

  const STAT_CARDS = [
    {
      label: 'Pending review',
      value: String(stats?.pendingReview ?? 0),
      bg: stats?.pendingReview ? 'bg-tract-red-light' : 'bg-white',
      border: 'border-tract-red/10',
      valueClass: 'text-tract-red',
      icon: FileText,
    },
    {
      label: 'Active deals',
      value: String(stats?.activeDeals ?? 0),
      bg: 'bg-white',
      border: 'border-[#4d4635]/20',
      valueClass: 'text-tract-green',
      icon: Gavel,
    },
    {
      label: 'Flagged penalties',
      value: String(stats?.flaggedPenalties ?? 0),
      bg: stats?.flaggedPenalties ? 'bg-tract-red-light' : 'bg-white',
      border: 'border-tract-red/10',
      valueClass: 'text-tract-red',
      icon: ShieldAlert,
    },
    {
      label: 'Total users',
      value: String(stats?.totalUsers ?? 0),
      bg: 'bg-white',
      border: 'border-[#4d4635]/20',
      valueClass: 'text-tract-obsidian',
      icon: Users,
    },
    {
      label: 'Platform revenue',
      value: formatCurrency(stats?.platformRevenue ?? 0),
      bg: 'bg-white',
      border: 'border-[#4d4635]/20',
      valueClass: 'text-tract-gold',
      icon: TrendingUp,
    },
  ]

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-tract-alabaster font-inter text-tract-obsidian">
      <main className="min-h-screen overflow-x-hidden px-4 py-8 md:p-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-playfair text-[28px] font-bold text-tract-obsidian">Admin Control Center</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => void refetch()}
              className="flex items-center gap-2 font-inter text-[12px] font-bold uppercase tracking-wider text-gray-400 hover:text-tract-obsidian transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <div className="text-right">
              <p className="font-inter text-base font-bold text-tract-obsidian">{displayName}</p>
              <p className="font-inter text-[13px] font-bold uppercase tracking-wider text-gray-500">Administrator</p>
            </div>
          </div>
        </header>

        <div className="mb-10 grid grid-cols-2 gap-6 lg:grid-cols-5">
          {STAT_CARDS.map((c) => (
            <div
              key={c.label}
              className={cn(
                'flex cursor-default flex-col justify-between rounded-2xl border p-6 transition-transform hover:scale-[1.02]',
                c.bg,
                c.border,
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-inter text-xs font-bold uppercase tracking-wider text-gray-500">{c.label}</p>
                <c.icon className="h-4 w-4 text-gray-300" strokeWidth={1.75} />
              </div>
              <p className={cn('font-playfair text-[36px] font-bold leading-none', c.valueClass)}>{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="border border-[#4d4635]/20 bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-widest text-gray-500">Pending compliance review</h3>
              {listings.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center gap-3">
                  <CheckCircle2 className="h-10 w-10 text-tract-green" strokeWidth={1} />
                  <p className="font-inter text-[14px] text-gray-400">No listings pending review.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {['Property', 'Wholesaler', 'Submitted', 'Flag', 'Action'].map((h) => (
                          <th
                            key={h}
                            className={cn(
                              'py-4 font-inter text-xs font-bold uppercase text-gray-500',
                              h === 'Action' && 'text-right',
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {listings.map((listing) => (
                        <tr key={listing.id} className="transition-colors hover:bg-gray-50">
                          <td className="py-5 font-inter text-base font-bold text-tract-obsidian">
                            {listing.propertyAddress}
                            {listing.city ? `, ${listing.city}` : ''}
                          </td>
                          <td className="py-5 font-inter text-sm text-gray-500">{listing.wholesalerName}</td>
                          <td className="py-5 font-inter text-sm text-gray-500">{listing.submittedAt}</td>
                          <td className="py-5">
                            <span
                              className={cn(
                                'rounded px-2 py-1 font-inter text-sm',
                                listing.outlierFlagged
                                  ? 'border border-amber-700/20 bg-amber-50 text-amber-800 font-bold'
                                  : 'bg-gray-100 text-gray-500',
                              )}
                            >
                              {listing.flagLabel}
                            </span>
                          </td>
                          <td className="space-x-2 py-5 text-right">
                            <button
                              type="button"
                              disabled={reviewListing.isPending}
                              onClick={() => reviewListing.mutate({ listingId: listing.id, action: 'approve' })}
                              className="rounded bg-tract-green px-3 py-1 font-inter text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={reviewListing.isPending}
                              onClick={() => reviewListing.mutate({ listingId: listing.id, action: 'reject' })}
                              className="rounded bg-tract-red px-3 py-1 font-inter text-sm font-bold text-white hover:opacity-80 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="border border-[#4d4635]/20 bg-white p-8 shadow-sm">
              <h3 className="mb-6 flex items-center font-playfair text-xl font-bold text-tract-obsidian">
                <ShieldAlert className="mr-2 h-6 w-6 text-tract-red" strokeWidth={1.75} aria-hidden />
                Recent automated penalties
              </h3>
              {penalties.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center gap-3">
                  <CheckCircle2 className="h-10 w-10 text-tract-green" strokeWidth={1} />
                  <p className="font-inter text-[14px] text-gray-400">No penalties recorded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {penalties.map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        'flex flex-col justify-between gap-3 border-l-4 p-4 transition-all sm:flex-row sm:items-center',
                        p.banApplied ? 'border-tract-red bg-tract-red-light/30' : 'border-amber-700 bg-amber-50/80',
                      )}
                    >
                      <div>
                        <p className="font-inter text-base font-bold text-tract-obsidian">
                          {p.violationLabel} <span className="font-normal text-gray-500">— {p.userName}</span>
                        </p>
                        <p className={cn('mt-1 font-inter text-sm italic', p.banApplied ? 'text-tract-red' : 'text-amber-800')}>
                          {p.scoreDeduction > 0 ? `-${p.scoreDeduction} pts` : 'No score impact'}
                          {p.banApplied ? ' • Ban applied' : ''}
                          {' • '}
                          {p.createdAt}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 inline-block px-2 py-1 rounded font-inter text-xs font-bold uppercase',
                          p.resolved ? 'bg-gray-100 text-gray-400' : 'bg-tract-red-light text-tract-red',
                        )}
                      >
                        {p.resolved ? 'Resolved' : 'Open'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <section className="flex h-full min-h-[420px] flex-col border border-[#4d4635]/20 bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-inter text-xs font-bold uppercase tracking-widest text-gray-500">Revenue tracker</h3>
              <div className="mb-10">
                <p className="font-playfair text-[40px] font-bold leading-none text-tract-gold">
                  {formatCurrency(stats?.platformRevenue ?? 0)}
                </p>
                <p className="mt-1 font-inter text-sm italic text-gray-500">Platform fees collected</p>
              </div>
              <div className="mt-auto border-t border-gray-100 pt-8">
                <div className="mb-3 flex justify-between font-inter text-sm">
                  <span className="text-gray-500">Live listings</span>
                  <span className="font-bold text-tract-gold">{stats?.liveListings ?? 0}</span>
                </div>
                <div className="mb-3 flex justify-between font-inter text-sm">
                  <span className="text-gray-500">Active deals</span>
                  <span className="font-bold text-tract-obsidian">{stats?.activeDeals ?? 0}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
