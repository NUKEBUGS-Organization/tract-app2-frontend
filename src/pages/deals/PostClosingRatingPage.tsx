import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Check, Loader2, Star, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/layout/Sidebar'
import { useDeal, useSubmitRating } from '@/hooks/useDeal'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'
import type { MarketplaceDeal } from '@/types'

const WHOLESALER_AVATAR = DEFAULT_AVATAR_IMAGE

function dealRefLine(dealId: string, deal: MarketplaceDeal | undefined): string {
  const ref = `#Deal-${dealId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'TRACT'}`
  const listing = deal?.listingId
  let address = 'Property address pending'
  if (listing && typeof listing === 'object' && 'propertyAddress' in listing) {
    const l = listing as { propertyAddress?: string; city?: string; stateCode?: string }
    address = [l.propertyAddress, l.city, l.stateCode].filter(Boolean).join(', ') || address
  }
  return `${address} · ${ref}`
}

export default function PostClosingRatingPage() {
  const { id: dealId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const { data: deal } = useDeal(dealId)
  const submitRating = useSubmitRating()

  useEffect(() => {
    if (!dealId) {
      navigate('/buyer/dashboard', { replace: true })
    }
  }, [dealId, navigate])

  const subtitle = useMemo(
    () => (dealId ? dealRefLine(dealId, deal) : ''),
    [dealId, deal],
  )

  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')

  const counterpartyName = useMemo(() => {
    if (!deal) return 'Counterparty'
    if (role === 'buyer' || role === 'realtor') {
      return deal.wholesaler?.fullName ?? 'Wholesaler'
    }
    return deal.primaryBuyer?.fullName ?? 'Buyer'
  }, [deal, role])

  const onSubmit = () => {
    if (stars === 0) {
      toast.error('Please select a star rating.')
      return
    }
    if (!dealId) return
    submitRating.mutate({ dealId, stars, comment: review.trim() || undefined })
  }

  const onSkip = () => {
    navigate('/buyer/dashboard', { replace: false })
  }

  if (!dealId) return null

  return (
    <DashboardLayout sidebar={<Sidebar />}>
      <main className="min-h-screen bg-app1-bg-main p-6 md:p-10">
      <header className="sticky top-0 z-40 -mx-6 border-b border-app1-border-light bg-app1-bg-card md:-mx-10">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link to="/buyer/dashboard" className="font-cinzel text-2xl font-black text-app1-primary">
            TRACT
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/buyer/marketplace" className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary">
              Listings
            </Link>
            <button
              type="button"
              className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary"
              onClick={() => navigate('/buyer/dashboard')}
            >
              Portfolio
            </button>
            <button
              type="button"
              className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary"
              onClick={() => navigate('/buyer/history')}
            >
              Insights
            </button>
            <button
              type="button"
              className="font-poppins text-base text-app1-text-muted transition-colors hover:text-app1-secondary"
              onClick={() => {
                window.location.href = 'mailto:support@tract.com'
              }}
            >
              Contact
            </button>
          </nav>
          <Link
            to="/buyer/marketplace"
            className="rounded-xl bg-app1-secondary px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-app1-premium transition-transform active:scale-95 hover:scale-[1.02]"
          >
            Invest now
          </Link>
        </div>
      </header>

      <div className="px-4 pb-16 pt-6 font-poppins text-app1-text-main md:px-12">
        <div className="relative mx-auto mt-12 max-w-[600px] overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card md:mt-16 md:p-12">
          <div className="flex flex-col items-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-app1-primary/10">
              <Check className="h-10 w-10 text-app1-primary" strokeWidth={3} aria-hidden />
              <span className="absolute -left-2 -top-2 h-2 w-2 rounded-full bg-app1-secondary" aria-hidden />
              <span className="absolute right-8 top-0 h-1.5 w-1.5 rounded-full bg-app1-danger/60" aria-hidden />
              <span className="absolute -bottom-2 left-6 h-1.5 w-1.5 rounded-full bg-app1-warning/80" aria-hidden />
              <span className="absolute -right-4 bottom-4 h-2 w-2 rounded-full bg-app1-primary/60" aria-hidden />
            </div>
            <h1 className="mt-4 text-center font-cinzel text-3xl font-black text-app1-primary">Deal closed successfully</h1>
            <p className="mt-2 text-center font-poppins text-sm text-app1-text-muted">{subtitle}</p>
          </div>

          <div className="my-8 h-px bg-app1-border-light" />

          <section>
            <h2 className="font-cinzel text-xl font-black text-app1-primary">Rate your experience</h2>
            <p className="mt-1 font-poppins text-sm text-app1-text-muted">
              Your rating is locked to this transaction. Only your counterparty can leave a review.
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-app1-border-light bg-app1-bg-soft p-4">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-app1-bg-soft">
                <img src={WHOLESALER_AVATAR} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-poppins text-sm font-semibold text-app1-text-main">{counterpartyName}</span>
                  <span className="rounded-full bg-app1-primary/10 px-2 py-0.5 font-poppins text-[10px] font-black uppercase tracking-[0.14em] text-app1-primary">
                    Verified wholesaler
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  className="rounded p-1 transition-transform hover:scale-110"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Star
                    className={cn(
                      'h-10 w-10 md:h-12 md:w-12',
                      n <= stars ? 'fill-app1-secondary text-app1-secondary' : 'fill-none text-app1-border-light',
                    )}
                    strokeWidth={n <= stars ? 0 : 1.5}
                    aria-hidden
                  />
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label htmlFor="rating-review" className="mb-1 block font-poppins text-xs font-bold uppercase tracking-wider text-app1-text-muted">
                Your review (optional)
              </label>
              <textarea
                id="rating-review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={5}
                placeholder="Describe your experience working with this wholesaler..."
                className="w-full resize-none rounded-lg border border-app1-border-light bg-app1-bg-card p-4 font-poppins text-base text-app1-text-main placeholder:text-app1-text-muted focus:border-app1-secondary focus:outline-none focus:ring-2 focus:ring-app1-secondary/40"
              />
            </div>

            <div className="mt-8 rounded-xl border border-app1-primary/20 bg-app1-primary/10 p-6">
              <span className="mb-3 block font-poppins text-xs font-black uppercase tracking-[0.16em] text-app1-primary">
                Your profile has been updated
              </span>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-app1-primary px-4 py-2 font-poppins text-sm font-semibold text-white">
                  <TrendingUp className="h-4 w-4" strokeWidth={2} aria-hidden />
                  +1 deal closed
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-app1-primary bg-app1-bg-card px-4 py-2 font-poppins text-sm font-semibold text-app1-primary">
                  <BadgeCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
                  Success rate: 87%
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled={submitRating.isPending}
                onClick={onSubmit}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-app1-primary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-app1-premium transition-all hover:scale-[1.02] disabled:opacity-60"
              >
                {submitRating.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : (
                  'Submit rating'
                )}
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="mt-4 w-full text-center font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main"
              >
                Skip for now
              </button>
            </div>
          </section>

          <footer className="mt-8 text-center">
            <p className="mx-auto max-w-[400px] font-poppins text-xs text-app1-text-muted">
              Reviews are monitored for bad faith. Retaliatory reviews result in a 7-day platform suspension.
            </p>
          </footer>
        </div>
      </div>

      <footer className="mt-12 border-t border-app1-border-light bg-app1-bg-card py-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-12">
          <div className="font-cinzel text-xl font-black text-app1-secondary">TRACT</div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/legal/privacy" className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main">
              Privacy policy
            </Link>
            <Link to="/legal/terms" className="font-poppins text-sm text-app1-text-muted transition-colors hover:text-app1-text-main">
              Terms of service
            </Link>
          </div>
          <p className="text-center font-poppins text-sm text-app1-text-muted">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
      </main>
    </DashboardLayout>
  )
}
