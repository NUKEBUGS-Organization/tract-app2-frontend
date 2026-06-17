import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import TopBar from '@/components/layout/TopBar'
import { useTitleDashboard, useConfirmEmd } from '@/hooks/useTitle'
import { BadgeCheck, Loader2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

export default function TitleEmdsPage() {
  const { data, isLoading } = useTitleDashboard()
  const confirmEmd = useConfirmEmd()
  const emds = data?.pendingEmds ?? []

  return (
    <DashboardLayout sidebar={<TitleRepSidebar />}>
      <div className="min-h-screen bg-theme-bg">
        <TopBar title="Pending EMDs" />
        <div className="mx-auto max-w-[900px] p-6 md:p-10">
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
            </div>
          )}

          {!isLoading && emds.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-20">
              <BadgeCheck className="h-16 w-16 text-tract-gold" strokeWidth={1} />
              <p className="font-inter text-[14px] text-theme-muted">No pending EMD confirmations.</p>
            </div>
          )}

          {!isLoading && emds.length > 0 && (
            <div className="space-y-4">
              {emds.map((emd) => {
                const isPending = emd.emdStatus === 'pending'
                return (
                  <div
                    key={emd.dealId}
                    className={cn(
                      'flex flex-col gap-4 rounded-[12px] border p-6 sm:flex-row sm:items-center sm:justify-between',
                      isPending
                        ? 'border-theme-border bg-theme-card'
                        : 'border-theme-border bg-theme-surface-2 opacity-75',
                    )}
                  >
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">Property</p>
                        <p className="font-inter text-[14px] font-bold text-theme-text">{emd.propertyLine}</p>
                      </div>
                      <div>
                        <p className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">Buyer</p>
                        <p className="font-inter text-[13px] text-theme-text">{emd.buyerName}</p>
                      </div>
                      <div>
                        <p className="font-inter text-[11px] font-bold uppercase tracking-wider text-theme-muted">Amount</p>
                        <p className="font-inter text-[14px] font-bold text-tract-gold">{formatCurrency(emd.emdAmount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          'rounded-full px-4 py-1.5 font-inter text-[12px] font-bold uppercase',
                          isPending
                            ? 'border border-amber-200 bg-amber-50 text-amber-700'
                            : 'bg-tract-green-light text-tract-green',
                        )}
                      >
                        {isPending ? 'Pending' : 'Received ✓'}
                      </span>
                      {isPending && (
                        <button
                          type="button"
                          disabled={confirmEmd.isPending}
                          onClick={() => confirmEmd.mutate(emd.dealId)}
                          className="bg-tract-gold px-4 py-2 font-inter text-[12px] font-bold uppercase tracking-wider text-white hover:bg-yellow-600 disabled:opacity-50"
                        >
                          Confirm Receipt
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
