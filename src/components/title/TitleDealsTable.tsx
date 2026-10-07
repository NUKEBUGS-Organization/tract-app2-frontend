import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdvanceTitleStep, type TitleDealRow } from '@/hooks/useTitle'
import { cn, formatCurrency } from '@/lib/utils'

interface TitleDealsTableProps {
  deals: TitleDealRow[]
  emptyMessage: string
}

export default function TitleDealsTable({ deals, emptyMessage }: TitleDealsTableProps) {
  const advanceStep = useAdvanceTitleStep()
  const [pendingId, setPendingId] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <thead>
          <tr className="border-b border-app1-border-light bg-app1-bg-soft">
            {['Property', 'Buyer', 'Lister', 'Current Step', 'Next Action', 'EMD', 'Action'].map((h) => (
              <th
                key={h}
                className={cn(
                  'px-6 py-4 font-poppins text-[10px] font-black uppercase tracking-[0.16em] text-app1-text-muted',
                  h === 'Action' && 'text-right',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-app1-border-light font-poppins text-sm text-app1-text-main">
          {deals.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-14 text-center text-sm text-app1-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            deals.map((deal) => {
              const isPending = advanceStep.isPending && pendingId === deal.id
              return (
                <tr key={deal.id} className="transition-colors hover:bg-app1-bg-soft/60">
                  <td className="px-6 py-5">
                    <Link
                      to={`/deals/${deal.id}`}
                      className="text-[14px] font-black text-app1-primary hover:text-app1-secondary hover:underline"
                    >
                      {deal.propertyLine || '—'}
                    </Link>
                    {deal.city ? (
                      <p className="mt-0.5 text-[12px] text-app1-text-muted">
                        {deal.city}
                        {deal.stateCode ? `, ${deal.stateCode}` : ''}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-6 py-5 text-app1-text-muted">{deal.buyerName}</td>
                  <td className="px-6 py-5 text-app1-text-muted">{deal.wholesalerName}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-app1-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                      {deal.stepLabel}
                    </span>
                  </td>
                  <td className={cn('px-6 py-5', !deal.needsAction && 'italic text-app1-text-muted')}>
                    {deal.nextAction}
                  </td>
                  <td className="px-6 py-5 text-app1-text-muted">
                    {deal.emdAmount > 0 ? formatCurrency(deal.emdAmount) : '—'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-4">
                      {deal.nextStep && deal.advanceLabel ? (
                        <button
                          type="button"
                          disabled={advanceStep.isPending}
                          onClick={() => {
                            if (!deal.nextStep) return
                            setPendingId(deal.id)
                            advanceStep.mutate({ dealId: deal.id, step: deal.nextStep })
                          }}
                          className="rounded-xl bg-app1-secondary px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                          {isPending ? 'Advancing…' : deal.advanceLabel}
                        </button>
                      ) : null}
                      <Link
                        to={`/deals/${deal.id}`}
                        className="text-[12px] font-bold uppercase tracking-wider text-app1-secondary hover:underline"
                      >
                        Details
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
