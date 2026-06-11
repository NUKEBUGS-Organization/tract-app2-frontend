import { AlertTriangle, CheckCircle2, Loader2, TrendingDown } from 'lucide-react'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useMyScore } from '@/hooks/useDeal'
import { useAuthStore } from '@/store/authStore'

export default function ScorePage() {
  const { data, isLoading } = useMyScore()
  const user = useAuthStore((s) => s.user)
  const score = data?.reliabilityScore ?? 100
  const tier = data?.tier ?? 'Elite'
  const penalties = data?.penalties ?? []

  const scoreColor =
    score >= 85 ? 'text-tract-green' : score >= 50 ? 'text-tract-orange' : 'text-tract-red'

  const tierBg =
    score >= 85
      ? 'bg-tract-green-light text-tract-green'
      : score >= 50
        ? 'bg-orange-50 text-tract-orange'
        : 'bg-tract-red-light text-tract-red'

  return (
    <div className="flex min-h-screen bg-theme-bg font-inter">
      <WholesalerSidebar />
      <main className="ml-[240px] flex-1 p-8 md:p-12">
        <h1 className="mb-8 font-playfair text-[28px] font-bold text-theme-text">Reliability Score</h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-tract-gold" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 text-center shadow-sm">
              <p className="mb-4 font-inter text-[12px] font-bold uppercase tracking-widest text-theme-muted">
                Current Score
              </p>
              <div className={`font-playfair text-[96px] font-bold leading-none ${scoreColor}`}>{score}</div>
              <span
                className={`mt-4 inline-block rounded-full px-4 py-1.5 font-inter text-[12px] font-bold uppercase tracking-widest ${tierBg}`}
              >
                {tier}
              </span>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-theme-border pt-6">
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase text-theme-muted">Deals Closed</p>
                  <p className="mt-1 font-playfair text-[24px] font-bold text-theme-text">
                    {data?.app2_totalClosed ?? user?.app2_totalDealsClosed ?? 0}
                  </p>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase text-theme-muted">Restrictions</p>
                  <p className="mt-1 font-playfair text-[24px] font-bold text-theme-text">
                    {score < 50 ? 'Yes' : 'None'}
                  </p>
                </div>
                <div>
                  <p className="font-inter text-[10px] font-bold uppercase text-theme-muted">Status</p>
                  <p className={`mt-1 font-playfair text-[24px] font-bold ${scoreColor}`}>{tier}</p>
                </div>
              </div>
            </div>

            {score < 70 && score >= 30 ? (
              <div className="flex items-start gap-4 rounded-[12px] border border-orange-200 bg-orange-50 p-6">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-tract-orange" />
                <div>
                  <p className="font-inter font-bold text-theme-text">Score Warning</p>
                  <p className="mt-1 font-inter text-[14px] text-theme-muted">
                    {score < 50
                      ? 'Your score is below 50. New listings are delayed 48 hours.'
                      : 'Your score is at risk. One more violation may trigger restrictions.'}
                  </p>
                </div>
              </div>
            ) : null}

            {score < 30 ? (
              <div className="flex items-start gap-4 rounded-[12px] border border-tract-red bg-tract-red-light p-6">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-tract-red" />
                <div>
                  <p className="font-inter font-bold text-tract-red">Account Restricted</p>
                  <p className="mt-1 font-inter text-[14px] text-tract-red/70">
                    Your score has dropped below 30. Contact support to appeal.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[12px] border border-theme-border bg-theme-card shadow-sm">
              <div className="border-b border-theme-border px-8 py-6">
                <h2 className="font-playfair text-[20px] font-bold text-theme-text">Score History</h2>
              </div>
              {penalties.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-tract-green" />
                  <p className="font-inter text-theme-muted">No penalties on record. Keep it up!</p>
                </div>
              ) : (
                <div className="divide-y divide-theme-border">
                  {penalties.map((p) => (
                    <div key={p._id} className="flex items-start justify-between gap-4 px-8 py-5">
                      <div className="flex items-start gap-4">
                        <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-tract-red" />
                        <div>
                          <p className="font-inter text-[14px] font-bold text-theme-text">
                            {p.violationType.replace(/_/g, ' ')}
                          </p>
                          <p className="mt-0.5 font-inter text-[12px] text-theme-muted">
                            {new Date(p.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      {p.scoreDeduction > 0 ? (
                        <span className="shrink-0 font-inter text-[14px] font-bold text-tract-red">
                          -{p.scoreDeduction} pts
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[12px] border border-theme-border bg-theme-card p-8 shadow-sm">
              <h2 className="mb-6 font-playfair text-[20px] font-bold text-theme-text">How Scoring Works</h2>
              <div className="space-y-4">
                {[
                  { label: 'Ghosting a deal', pts: -10 },
                  { label: 'Missed 72hr deadline', pts: -15 },
                  { label: 'Missed inspection', pts: -20 },
                  { label: 'Successful close', pts: 0, positive: true },
                ].map((rule) => (
                  <div
                    key={rule.label}
                    className="flex items-center justify-between border-b border-theme-border py-3 last:border-0"
                  >
                    <span className="font-inter text-[14px] text-theme-muted">{rule.label}</span>
                    <span
                      className={`font-inter text-[14px] font-bold ${
                        rule.positive ? 'text-tract-green' : 'text-tract-red'
                      }`}
                    >
                      {rule.positive ? 'Score preserved' : `${rule.pts} pts`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
