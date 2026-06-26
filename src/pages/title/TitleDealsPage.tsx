import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import TopBar from '@/components/layout/TopBar'
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
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="Active Deals" />
        <div className="mx-auto max-w-[1440px] p-6 md:p-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {!isLoading && (
            <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-theme-border bg-theme-surface-2">
                    {['Property', 'Buyer', 'Step', 'Next Action', 'EMD', 'Advance'].map((h) => (
                      <th
                        key={h}
                        className={cn(
                          'px-6 py-4 font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted',
                          h === 'Advance' && 'text-right',
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center font-inter text-theme-muted">
                        No deals assigned yet.
                      </td>
                    </tr>
                  ) : (
                    deals.map((deal) => (
                      <tr key={deal.id} className="transition-colors hover:bg-theme-surface-2">
                        <td className="px-6 py-4">
                          <Link
                            to={`/deals/${deal.id}`}
                            className="font-inter text-[14px] font-bold text-theme-text hover:text-tract-gold hover:underline"
                          >
                            {deal.propertyLine || '—'}
                          </Link>
                          <p className="mt-0.5 font-inter text-[12px] text-theme-muted">
                            {deal.city}
                            {deal.stateCode ? `, ${deal.stateCode}` : ''}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-inter text-[13px] text-theme-muted">{deal.buyerName}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block rounded-full bg-tract-green-light px-3 py-1 font-inter text-[11px] font-bold uppercase tracking-wider text-tract-green">
                            {deal.stepLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-inter text-[13px] text-theme-muted">{deal.nextAction}</td>
                        <td className="px-6 py-4 font-inter text-[13px] text-theme-muted">
                          {deal.emdAmount > 0 ? `$${deal.emdAmount.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {deal.advanceLabel ? (
                            <button
                              type="button"
                              disabled={advanceStep.isPending}
                              onClick={() => advanceStep.mutate(deal.id)}
                              className="rounded-lg bg-tract-gold px-4 py-2 font-inter text-[12px] font-bold uppercase tracking-wider text-white hover:bg-yellow-600 disabled:opacity-50"
                            >
                              {deal.advanceLabel}
                            </button>
                          ) : (
                            <span className="font-inter text-[12px] text-theme-muted">—</span>
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
