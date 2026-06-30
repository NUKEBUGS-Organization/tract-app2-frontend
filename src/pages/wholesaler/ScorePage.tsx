import { AlertTriangle, CheckCircle2, Loader2, TrendingDown } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
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
    score >= 85 ? 'text-app1-primary' : score >= 50 ? 'text-app1-warning' : 'text-app1-danger'

  const tierBg =
    score >= 85
      ? 'bg-app1-primary/10 text-app1-primary'
      : score >= 50
        ? 'bg-orange-50 text-app1-warning'
        : 'bg-app1-danger/10 text-app1-danger'

  return (
    <DashboardLayout sidebar={<WholesalerSidebar />}>
      <main className="flex-1 bg-app1-bg-main p-6 md:p-8 lg:p-12">

        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-app1-text-muted">
            Wholesaler Workspace
          </p>
          <h1 className="mt-1 font-cinzel text-3xl font-black text-app1-primary">
            Reliability Score
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-app1-secondary" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 text-center shadow-app1-card">
              <p className="mb-4 font-poppins text-[11px] font-black uppercase tracking-[0.2em] text-app1-text-muted">
                Current Score
              </p>
              <div className={`font-cinzel text-[96px] font-black leading-none ${scoreColor}`}>{score}</div>
              <span
                className={`mt-4 inline-block rounded-full px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.18em] ${tierBg}`}
              >
                {tier}
              </span>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-app1-border-light pt-6">
                <div>
                  <p className="font-poppins text-[10px] font-black uppercase text-app1-text-muted">Deals Closed</p>
                  <p className="mt-1 font-cinzel text-[24px] font-black text-app1-primary">
                    {data?.app2_totalClosed ?? user?.app2_totalDealsClosed ?? 0}
                  </p>
                </div>
                <div>
                  <p className="font-poppins text-[10px] font-black uppercase text-app1-text-muted">Restrictions</p>
                  <p className="mt-1 font-cinzel text-[24px] font-black text-app1-primary">
                    {score < 50 ? 'Yes' : 'None'}
                  </p>
                </div>
                <div>
                  <p className="font-poppins text-[10px] font-black uppercase text-app1-text-muted">Status</p>
                  <p className={`mt-1 font-cinzel text-[24px] font-black ${scoreColor}`}>{tier}</p>
                </div>
              </div>
            </div>

            {score < 70 && score >= 30 ? (
              <div className="flex items-start gap-4 rounded-app1-card border border-orange-200 bg-orange-50 p-6 shadow-app1-card">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-app1-warning" />
                <div>
                  <p className="font-poppins font-black text-app1-text-main">Score Warning</p>
                  <p className="mt-1 font-poppins text-[14px] text-app1-text-muted">
                    {score < 50
                      ? 'Your score is below 50. New listings are delayed 48 hours.'
                      : 'Your score is at risk. One more violation may trigger restrictions.'}
                  </p>
                </div>
              </div>
            ) : null}

            {score < 30 ? (
              <div className="flex items-start gap-4 rounded-app1-card border border-app1-danger bg-app1-danger/5 p-6 shadow-app1-card">
                <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-app1-danger" />
                <div>
                  <p className="font-poppins font-black text-app1-danger">Account Restricted</p>
                  <p className="mt-1 font-poppins text-[14px] text-app1-danger/70">
                    Your score has dropped below 30. Contact support to appeal.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
              <div className="border-b border-app1-border-light px-8 py-6">
                <h2 className="font-cinzel text-[20px] font-black text-app1-primary">Score History</h2>
              </div>
              {penalties.length === 0 ? (
                <div className="px-8 py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-app1-primary" />
                  <p className="font-poppins text-app1-text-muted">No penalties on record. Keep it up!</p>
                </div>
              ) : (
                <div className="divide-y divide-app1-border-light">
                  {penalties.map((p) => (
                    <div key={p._id} className="flex items-start justify-between gap-4 px-8 py-5">
                      <div className="flex items-start gap-4">
                        <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-app1-danger" />
                        <div>
                          <p className="font-poppins text-[14px] font-black text-app1-text-main">
                            {p.violationType.replace(/_/g, ' ')}
                          </p>
                          <p className="mt-0.5 font-poppins text-[12px] text-app1-text-muted">
                            {new Date(p.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      {p.scoreDeduction > 0 ? (
                        <span className="shrink-0 font-poppins text-[14px] font-black text-app1-danger">
                          -{p.scoreDeduction} pts
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
              <h2 className="mb-6 font-cinzel text-[20px] font-black text-app1-primary">How Scoring Works</h2>
              <div className="space-y-4">
                {[
                  { label: 'Ghosting a deal', pts: -10 },
                  { label: 'Missed 72hr deadline', pts: -15 },
                  { label: 'Missed inspection', pts: -20 },
                  { label: 'Successful close', pts: 0, positive: true },
                ].map((rule) => (
                  <div
                    key={rule.label}
                    className="flex items-center justify-between border-b border-app1-border-light py-3 last:border-0"
                  >
                    <span className="font-poppins text-[14px] text-app1-text-muted">{rule.label}</span>
                    <span
                      className={`font-poppins text-[14px] font-black ${
                        rule.positive ? 'text-app1-primary' : 'text-app1-danger'
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
    </DashboardLayout>
  )
}
