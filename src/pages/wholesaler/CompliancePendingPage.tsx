import {
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Shield,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

const CHECKLIST = [
  { key: 'docs', label: 'Document authenticity check', Icon: ShieldCheck },
  { key: 'arv', label: 'ARV plausibility scan', Icon: BarChart3 },
  { key: 'fraud', label: 'Fraud signal detection', Icon: Shield },
] as const

export default function CompliancePendingPage() {
  const [searchParams] = useSearchParams()
  const fromId = searchParams.get('from') ?? ''
  const submissionHref =
    fromId !== ''
      ? `/wholesaler/listings/new?step=review&from=${encodeURIComponent(fromId)}`
      : '/wholesaler/listings/new?step=review'

  return (
    <div className="flex min-h-screen flex-col bg-tract-alabaster font-inter text-tract-obsidian">
      <nav className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 py-4 md:px-12">
        <Link to="/wholesaler/dashboard" className="font-playfair text-[24px] font-bold text-tract-green">
          TRACT
        </Link>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden items-center gap-6 md:flex">
            <Link
              to="/buyer/marketplace"
              className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold"
            >
              Listings
            </Link>
            <a href="#" className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold">
              Portfolio
            </a>
            <a href="#" className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold">
              Insights
            </a>
            <a href="#" className="font-inter text-base text-gray-500 transition-colors hover:text-tract-gold">
              Contact
            </a>
          </div>
          <Link
            to="/buyer/marketplace"
            className="shrink-0 rounded bg-tract-gold px-4 py-2 font-inter text-sm font-semibold text-[#554300] transition-transform active:scale-95"
          >
            Invest Now
          </Link>
        </div>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-[560px] flex-col items-center">
          <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-tract-gold animate-compliance-orbit"
              aria-hidden
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 bg-white">
              <FileText className="h-8 w-8 text-tract-gold" strokeWidth={1.75} aria-hidden />
            </div>
          </div>

          <h1 className="mb-2 text-center font-playfair text-4xl font-bold leading-tight text-tract-obsidian md:text-5xl">
            Compliance review
          </h1>
          <p className="mb-10 max-w-[420px] text-center font-inter text-base text-gray-500">
            Your listing is being reviewed for authenticity. This typically takes under 5 minutes.
          </p>

          <div className="mb-8 w-full rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              {CHECKLIST.map(({ key, label, Icon }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-6 w-6 shrink-0 text-tract-gold" strokeWidth={1.75} aria-hidden />
                    <span className="font-inter text-base text-tract-obsidian">{label}</span>
                  </div>
                  <div
                    className="h-4 w-4 shrink-0 rounded-full border-2 border-tract-gold/20 border-t-tract-gold animate-spin"
                    aria-hidden
                  />
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 opacity-50">
                <div className="flex min-w-0 items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-gray-500" strokeWidth={1.75} aria-hidden />
                  <span className="font-inter text-base text-gray-500">Final approval</span>
                </div>
                <Clock className="h-6 w-6 shrink-0 text-gray-500" strokeWidth={1.75} aria-hidden />
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-gray-500">
                  Current status
                </span>
                <span className="font-inter text-sm font-semibold tracking-wide text-tract-gold">
                  Estimated: 3 minutes remaining
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full w-[40%] rounded-full bg-tract-green-light animate-compliance-bar-flow" />
              </div>
            </div>
          </div>

          <div className="mb-10 grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-1 rounded-lg border border-tract-green/20 bg-tract-green/10 p-4">
              <div className="flex items-center gap-2 text-tract-green-light">
                <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                <span className="font-inter text-[12px] font-bold uppercase tracking-wider">Pass</span>
              </div>
              <p className="font-inter text-sm text-gray-400">Your listing will be marked LIVE automatically.</p>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-tract-red/30 bg-tract-red/10 p-4">
              <div className="flex items-center gap-2 text-tract-red-light">
                <XCircle className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                <span className="font-inter text-[12px] font-bold uppercase tracking-wider text-tract-red-light">
                  Fail
                </span>
              </div>
              <p className="font-inter text-sm text-gray-400">Our team will contact you within 24 hours.</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-inter text-sm text-gray-500">You&apos;ll receive a notification when your review is complete.</p>
            <Link
              to={submissionHref}
              className="font-inter text-sm font-semibold text-gray-400 underline decoration-gray-600 underline-offset-4 transition-colors hover:text-tract-gold"
            >
              View submission details
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-12">
          <span className="font-playfair text-[20px] font-bold text-tract-green">TRACT</span>
          <nav className="flex flex-wrap justify-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Legal Notices', 'Regulatory Disclosure'].map((label) => (
              <a key={label} href="#" className="font-inter text-sm text-gray-500 transition-colors hover:text-tract-obsidian">
                {label}
              </a>
            ))}
          </nav>
          <p className="font-inter text-sm text-gray-500">© 2024 TRACT Private Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
