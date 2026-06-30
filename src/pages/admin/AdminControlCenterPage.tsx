import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Gavel,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import DashboardLayout from '@/components/layout/DashboardLayout'
import HeroBanner from '@/components/app1/HeroBanner'
import StatCard from '@/components/app1/StatCard'
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
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
        </main>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4">
          <AlertTriangle className="h-10 w-10 text-app1-danger" />
          <p className="font-poppins text-sm text-app1-text-muted">Failed to load admin dashboard.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="flex items-center gap-2 font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-secondary hover:underline"
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
      label: 'Pending Review',
      value: stats?.pendingReview ?? 0,
      note: 'Listings awaiting decision',
      icon: FileText,
      path: '/admin/listings',
      tone: stats?.pendingReview ? ('danger' as const) : ('neutral' as const),
    },
    {
      label: 'Active Deals',
      value: stats?.activeDeals ?? 0,
      note: 'In progress platform-wide',
      icon: Gavel,
      path: '/admin/deals',
      tone: 'primary' as const,
    },
    {
      label: 'Flagged Penalties',
      value: stats?.flaggedPenalties ?? 0,
      note: 'Open violations',
      icon: ShieldAlert,
      path: '/admin/penalties',
      tone: stats?.flaggedPenalties ? ('danger' as const) : ('neutral' as const),
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      note: 'All platform accounts',
      icon: Users,
      path: '/admin/users',
      tone: 'neutral' as const,
    },
    {
      label: 'Platform Revenue',
      value: formatCurrency(stats?.platformRevenue ?? 0),
      note: 'Fees collected to date',
      icon: TrendingUp,
      tone: 'primary' as const,
      featured: true,
    },
  ]

  return (
    <DashboardLayout sidebar={<AdminSidebar />} className="bg-app1-bg-main font-poppins text-app1-text-main">
      <main className="min-h-screen overflow-x-hidden px-4 py-8 md:p-10 space-y-8">
        <HeroBanner
          eyebrow="Admin Workspace"
          title="Your Admin Control Center"
          description={`Welcome back, ${displayName}. Manage users, review verifications, approve listings, track deals, and monitor platform health — all from one premium control center.`}
          badgeText="Live admin metrics"
          actions={
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all duration-200 hover:bg-white/15 hover:border-white/35"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-cinzel text-2xl font-black text-app1-primary">Platform Overview</h2>
              <p className="mt-1 text-sm leading-6 text-app1-text-muted">Key platform totals and admin queues.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-app1-border-light bg-app1-bg-card px-3 py-2 text-xs font-black text-app1-primary shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-app1-secondary" />
              Live metrics
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5">
            {STAT_CARDS.map((c) => (
              <StatCard
                key={c.label}
                label={c.label}
                value={c.value}
                note={c.note}
                icon={c.icon}
                path={c.path}
                tone={c.tone}
                featured={c.featured}
              />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
              <h3 className="mb-6 font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-text-muted">
                Pending Compliance Review
              </h3>
              {listings.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle2 className="h-10 w-10 text-app1-primary" strokeWidth={1} />
                  <p className="font-poppins text-sm text-app1-text-muted">No listings pending review.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-app1-border-light">
                        {['Property', 'Wholesaler', 'Submitted', 'Flag', 'Action'].map((h) => (
                          <th
                            key={h}
                            className={cn(
                              'py-4 font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted',
                              h === 'Action' && 'text-right',
                            )}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app1-border-light">
                      {listings.map((listing) => (
                        <tr key={listing.id} className="transition-colors hover:bg-app1-bg-soft/60">
                          <td className="py-5 font-poppins text-sm font-black text-app1-primary">
                            {listing.propertyAddress}
                            {listing.city ? `, ${listing.city}` : ''}
                          </td>
                          <td className="py-5 font-poppins text-sm text-app1-text-muted">{listing.wholesalerName}</td>
                          <td className="py-5 font-poppins text-sm text-app1-text-muted">{listing.submittedAt}</td>
                          <td className="py-5">
                            <span
                              className={cn(
                                'rounded-full px-3 py-1 font-poppins text-xs',
                                listing.outlierFlagged
                                  ? 'border border-app1-warning/30 bg-app1-warning/10 font-bold text-app1-warning'
                                  : 'bg-app1-bg-soft text-app1-text-muted',
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
                              className="rounded-lg bg-app1-primary px-3 py-1.5 font-poppins text-xs font-bold text-white hover:opacity-85 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={reviewListing.isPending}
                              onClick={() => reviewListing.mutate({ listingId: listing.id, action: 'reject' })}
                              className="rounded-lg bg-app1-danger px-3 py-1.5 font-poppins text-xs font-bold text-white hover:opacity-85 disabled:opacity-50"
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

            <section className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
              <h3 className="mb-6 flex items-center font-cinzel text-xl font-black text-app1-primary">
                <ShieldAlert className="mr-2 h-6 w-6 text-app1-danger" strokeWidth={1.75} aria-hidden />
                Recent Automated Penalties
              </h3>
              {penalties.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle2 className="h-10 w-10 text-app1-primary" strokeWidth={1} />
                  <p className="font-poppins text-sm text-app1-text-muted">No penalties recorded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {penalties.map((p) => (
                    <div
                      key={p.id}
                      className={cn(
                        'flex flex-col justify-between gap-3 rounded-xl border-l-4 p-4 transition-all sm:flex-row sm:items-center',
                        p.banApplied ? 'border-app1-danger bg-app1-danger/5' : 'border-app1-warning bg-app1-warning/5',
                      )}
                    >
                      <div>
                        <p className="font-poppins text-sm font-black text-app1-text-main">
                          {p.violationLabel} <span className="font-normal text-app1-text-muted">— {p.userName}</span>
                        </p>
                        <p
                          className={cn(
                            'mt-1 font-poppins text-sm italic',
                            p.banApplied ? 'text-app1-danger' : 'text-app1-warning',
                          )}
                        >
                          {p.scoreDeduction > 0 ? `-${p.scoreDeduction} pts` : 'No score impact'}
                          {p.banApplied ? ' • Ban applied' : ''}
                          {' • '}
                          {p.createdAt}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 inline-block rounded-full px-3 py-1 font-poppins text-xs font-bold uppercase tracking-wide',
                          p.resolved ? 'bg-app1-bg-soft text-app1-text-muted' : 'bg-app1-danger/10 text-app1-danger',
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
            <section className="flex h-full min-h-[420px] flex-col rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
              <h3 className="mb-6 font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-text-muted">
                Revenue Tracker
              </h3>
              <div className="mb-10">
                <p className="font-cinzel text-4xl font-black leading-none text-app1-secondary">
                  {formatCurrency(stats?.platformRevenue ?? 0)}
                </p>
                <p className="mt-2 font-poppins text-sm italic text-app1-text-muted">Platform fees collected</p>
              </div>
              <div className="mt-auto space-y-3 border-t border-app1-border-light pt-6">
                <div className="flex justify-between font-poppins text-sm">
                  <span className="text-app1-text-muted">Live listings</span>
                  <span className="font-bold text-app1-secondary">{stats?.liveListings ?? 0}</span>
                </div>
                <div className="flex justify-between font-poppins text-sm">
                  <span className="text-app1-text-muted">Active deals</span>
                  <span className="font-bold text-app1-primary">{stats?.activeDeals ?? 0}</span>
                </div>
              </div>
              <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-app1-border-light bg-app1-bg-soft px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-app1-secondary" />
                Updated live
              </div>
            </section>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
