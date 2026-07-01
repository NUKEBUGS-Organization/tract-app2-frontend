import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import PageHeader from '@/components/app1/PageHeader'
import { useTitleDashboard, useAdvanceTitleStep } from '@/hooks/useTitle'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function TitleDealsPage() {
  const { data, isLoading } = useTitleDashboard()
  const advanceStep = useAdvanceTitleStep()
  const deals = data?.activeDeals ?? []

  return (
    <DashboardLayout sidebar={<TitleRepSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1440px] space-y-8 p-6 md:p-10">
          <PageHeader
            eyebrow="Title Representative"
            title="Active Deals"
            description="Review and advance deals assigned to your title company."
          />

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {!isLoading && (
            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-app1-border-light bg-app1-bg-soft">
                      {['Property', 'Buyer', 'Step', 'Next Action', 'EMD', 'Advance'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-6 py-4 font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted',
                            h === 'Advance' && 'text-right',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app1-border-light">
                    {deals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center font-poppins text-app1-text-muted">
                          No deals assigned yet.
                        </td>
                      </tr>
                    ) : (
                      deals.map((deal) => (
                        <tr key={deal.id} className="transition-colors hover:bg-app1-bg-soft/60">
                          <td className="px-6 py-4">
                            <Link
                              to={`/deals/${deal.id}`}
                              className="font-poppins text-[14px] font-black text-app1-primary hover:text-app1-secondary hover:underline"
                            >
                              {deal.propertyLine || '—'}
                            </Link>
                            <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                              {deal.city}
                              {deal.stateCode ? `, ${deal.stateCode}` : ''}
                            </p>
                          </td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">{deal.buyerName}</td>
                          <td className="px-6 py-4">
                            <span className="inline-block rounded-full bg-app1-primary/10 px-3 py-1 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                              {deal.stepLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">{deal.nextAction}</td>
                          <td className="px-6 py-4 font-poppins text-[13px] text-app1-text-muted">
                            {deal.emdAmount > 0 ? `$${deal.emdAmount.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {deal.advanceLabel ? (
                              <button
                                type="button"
                                disabled={advanceStep.isPending}
                                onClick={() => advanceStep.mutate(deal.id)}
                                className="rounded-xl bg-app1-secondary px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] disabled:opacity-50"
                              >
                                {deal.advanceLabel}
                              </button>
                            ) : (
                              <span className="font-poppins text-[12px] text-app1-text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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
