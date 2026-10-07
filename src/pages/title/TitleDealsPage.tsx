import { Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import TitleDealsTable from '@/components/title/TitleDealsTable'
import PageHeader from '@/components/app1/PageHeader'
import { useTitleDashboard } from '@/hooks/useTitle'

export default function TitleDealsPage() {
  const { data, isLoading, isError, refetch } = useTitleDashboard()

  return (
    <DashboardLayout sidebar={<TitleRepSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">
          <PageHeader
            eyebrow="Title Representative"
            title="Assigned Deals"
            description="Every open deal a TRACT admin has assigned to you. Open a deal for the full details and title package."
          />

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          ) : isError ? (
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-poppins text-sm font-bold uppercase tracking-wider text-app1-secondary hover:underline"
            >
              Could not load deals. Retry
            </button>
          ) : (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <TitleDealsTable deals={data?.activeDeals ?? []} emptyMessage="No deals assigned to you yet." />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
