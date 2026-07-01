import DashboardLayout from '@/components/layout/DashboardLayout'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import PageHeader from '@/components/app1/PageHeader'
import { useTitleDashboard, useConfirmEmd } from '@/hooks/useTitle'
import { BadgeCheck, Loader2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

export default function TitleEmdsPage() {
  const { data, isLoading } = useTitleDashboard()
  const confirmEmd = useConfirmEmd()
  const emds = data?.pendingEmds ?? []

  return (
    <DashboardLayout sidebar={<TitleRepSidebar />}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[900px] space-y-8 p-6 md:p-10">
          <PageHeader
            eyebrow="Title Representative"
            title="Pending EMDs"
            description="Confirm earnest money deposits received for active deals."
          />

          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
            </div>
          )}

          {!isLoading && emds.length === 0 && (
            <div className="flex flex-col items-center gap-4 rounded-app1-card border border-app1-border-light bg-app1-bg-card py-20 text-center shadow-app1-card">
              <BadgeCheck className="h-16 w-16 text-app1-secondary" strokeWidth={1} />
              <p className="font-poppins text-[14px] text-app1-text-muted">No pending EMD confirmations.</p>
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
                      'flex flex-col gap-4 rounded-app1-card border p-6 shadow-app1-card sm:flex-row sm:items-center sm:justify-between',
                      isPending
                        ? 'border-app1-border-light bg-app1-bg-card'
                        : 'border-app1-border-light bg-app1-bg-soft opacity-75',
                    )}
                  >
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                          Property
                        </p>
                        <p className="font-poppins text-[14px] font-black text-app1-primary">{emd.propertyLine}</p>
                      </div>
                      <div>
                        <p className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                          Buyer
                        </p>
                        <p className="font-poppins text-[13px] text-app1-text-main">{emd.buyerName}</p>
                      </div>
                      <div>
                        <p className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
                          Amount
                        </p>
                        <p className="font-poppins text-[14px] font-black text-app1-secondary">
                          {formatCurrency(emd.emdAmount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          'rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em]',
                          isPending
                            ? 'border border-app1-secondary/20 bg-app1-secondary/10 text-app1-secondary'
                            : 'bg-app1-primary/10 text-app1-primary',
                        )}
                      >
                        {isPending ? 'Pending' : 'Received ✓'}
                      </span>
                      {isPending && (
                        <button
                          type="button"
                          disabled={confirmEmd.isPending}
                          onClick={() => confirmEmd.mutate(emd.dealId)}
                          className="rounded-xl bg-app1-secondary px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] disabled:opacity-50"
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
