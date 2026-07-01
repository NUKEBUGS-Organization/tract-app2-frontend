import { CheckCircle2, Clock, FileText, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CompliancePendingPage() {
  const checks = [
    { label: 'Document authenticity check', done: false },
    { label: 'ARV plausibility scan', done: false },
    { label: 'Fraud signal detection', done: false },
    { label: 'Final approval', done: false, pending: true },
  ]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-app1-bg-main px-4 py-16 font-poppins">

      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-app1-secondary bg-app1-secondary/10">
        <FileText className="h-10 w-10 text-app1-secondary" strokeWidth={1.5} />
      </div>

      <h1 className="mb-2 font-cinzel text-3xl font-black text-app1-primary md:text-4xl">
        Compliance Review
      </h1>
      <p className="mb-10 max-w-md text-center font-poppins text-[15px] leading-relaxed text-app1-text-muted">
        Your listing is being reviewed for authenticity. This typically takes under 5 minutes.
      </p>

      <div className="mb-8 w-full max-w-[520px] rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">

        <div className="mb-6 flex justify-between items-center">
          <span className="font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-text-muted">
            Current Status
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-app1-secondary/10 px-4 py-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-app1-secondary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-app1-secondary" />
            </span>
            Estimated: 3 minutes remaining
          </span>
        </div>

        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-xl border border-app1-border-light bg-app1-bg-soft px-5 py-4"
            >
              <span
                className={`font-poppins text-[14px] ${
                  check.pending ? 'text-app1-text-muted opacity-50' : 'text-app1-text-main'
                }`}
              >
                {check.label}
              </span>
              {check.pending ? (
                <Clock className="h-5 w-5 text-app1-text-muted opacity-40" strokeWidth={1.75} />
              ) : check.done ? (
                <CheckCircle2 className="h-5 w-5 text-app1-primary" strokeWidth={1.75} />
              ) : (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-app1-border-light border-t-app1-secondary" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8 grid w-full max-w-[520px] grid-cols-2 gap-4">
        <div className="rounded-xl border border-app1-border-light bg-app1-bg-card p-5 text-center shadow-sm">
          <p className="font-poppins text-[13px] leading-relaxed text-app1-text-muted">
            Your listing will be marked <span className="font-bold text-app1-primary">LIVE</span> automatically.
          </p>
        </div>
        <div className="rounded-xl border border-app1-border-light bg-app1-bg-card p-5 text-center shadow-sm">
          <p className="font-poppins text-[13px] leading-relaxed text-app1-text-muted">
            Our team will contact you within <span className="font-bold text-app1-primary">24 hours</span>.
          </p>
        </div>
      </div>

      <p className="mb-3 font-poppins text-[13px] text-app1-text-muted">
        You'll receive a notification when your review is complete.
      </p>
      <Link
        to="/wholesaler/listings"
        className="flex items-center gap-1.5 font-poppins text-[11px] font-black uppercase tracking-[0.18em] text-app1-secondary hover:underline"
      >
        <LinkIcon className="h-3.5 w-3.5" />
        View submission details
      </Link>

      <p className="mt-12 font-poppins text-[12px] text-app1-text-muted">
        © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
      </p>
    </div>
  )
}
