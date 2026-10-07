import { AlertTriangle, Briefcase, Calendar, CheckCircle2, Loader2, Lock, RefreshCw } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import TitleDealsTable from '@/components/title/TitleDealsTable'
import HeroBanner from '@/components/app1/HeroBanner'
import StatCard from '@/components/app1/StatCard'
import { useAuthStore } from '@/store/authStore'
import { useTitleDashboard } from '@/hooks/useTitle'

export default function TitleRepDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const displayName = user?.fullName?.trim() || 'Title Representative'
  const { data, isLoading, isError, refetch } = useTitleDashboard()

  const stats = data?.stats
  const needsAction = (data?.activeDeals ?? []).filter((d) => d.needsAction)

  return (
    <DashboardLayout sidebar={<TitleRepSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">
          <HeroBanner
            eyebrow="Title Workspace"
            title={`Welcome, ${displayName}.`}
            description="Deals a TRACT admin has assigned to you. Open any deal for full property details, prices, parties, documents and the title package."
            badgeText="Assigned by TRACT admin"
            actions={
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 font-poppins text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/20"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            }
          />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <AlertTriangle className="h-10 w-10 text-app1-danger" />
              <p className="font-poppins text-app1-text-muted">Failed to load dashboard.</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                <StatCard
                  label="Assigned Deals"
                  value={stats?.activeDeals ?? 0}
                  note="Open deals"
                  icon={Briefcase}
                  tone="primary"
                  path="/title/deals"
                />
                <StatCard
                  label="Needs Your Action"
                  value={stats?.dealsNeedingAction ?? 0}
                  note="Ready to advance"
                  icon={AlertTriangle}
                  tone={stats?.dealsNeedingAction ? 'danger' : 'neutral'}
                  path="/title/deals"
                />
                <StatCard
                  label="Closing This Week"
                  value={stats?.closingThisWeek ?? 0}
                  note="Clear to close issued"
                  icon={Calendar}
                  tone="warning"
                  path="/title/deals"
                />
                <StatCard
                  label="Closed"
                  value={stats?.closedDeals ?? 0}
                  note="Funded & closed"
                  icon={CheckCircle2}
                  tone="neutral"
                />
              </div>

              <section className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
                <div className="border-b border-app1-border-light px-6 py-5">
                  <h3 className="font-cinzel text-xl font-black text-app1-primary">Needs Your Action</h3>
                </div>
                <TitleDealsTable
                  deals={needsAction}
                  emptyMessage={
                    stats?.activeDeals
                      ? 'Nothing to advance right now — your deals are waiting on the buyer or lister.'
                      : 'No deals assigned to you yet. An admin will assign deals here.'
                  }
                />
                <div className="mx-6 mb-6 mt-4 flex gap-4 rounded-xl border border-app1-warning/30 bg-app1-warning/5 p-4">
                  <Lock className="h-5 w-5 shrink-0 text-app1-warning" strokeWidth={2} aria-hidden />
                  <p className="font-poppins text-[13px] leading-snug text-app1-text-muted">
                    From title search onward, only you and TRACT admins can advance these deals. Earlier steps stay
                    with the buyer and lister.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
