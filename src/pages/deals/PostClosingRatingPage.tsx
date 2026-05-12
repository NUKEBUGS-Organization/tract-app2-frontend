import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BadgeCheck, Check, Loader2, Star, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useDeal, useSubmitRating } from '@/hooks/useDeal'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const WHOLESALER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAH0tmFOERZVpNH4hhS2p-I8HaBjGvghf6JdDfxfzWMvJ3MZwcNJiRi4HgY7XYsCNUVjuuSvoAowIqLwn-VGFqcs7HhHsqWRIvC3GLuFyUMz6qBtZGgM2YrfIrW1TS6K2fJhvrosFJW-BD33biQeVqzdnhiMASAGUsmOYglCAQ2jTNt51LyBsMA1qEe9ThjcpoFJ8oe8_dxMlI3x8XsN86s-rW5xaVz60L0TsMMHHQoE5nof9sEvP_Hc8mTNXnyv5RzqRGoMZhsQ0M'

function dealRefLine(dealId: string | undefined): string {
  const ref =
    !dealId || dealId === 'under-contract-demo'
      ? '#Deal-A047'
      : `#Deal-${dealId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'TRACT'}`
  return `4821 Maple Drive, Austin TX · ${ref}`
}

export default function PostClosingRatingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.user?.role)
  const { data: deal } = useDeal(id)
  const submitRating = useSubmitRating()

  const subtitle = useMemo(() => dealRefLine(id), [id])

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
    if (!id) return
    submitRating.mutate({ dealId: id, stars, comment: review.trim() || undefined })
  }

  const onSkip = () => {
    navigate('/buyer/dashboard', { replace: false })
  }

  return (
    <div className="min-h-screen bg-tract-alabaster font-inter text-tract-obsidian">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#323538] bg-[#111417]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-12">
          <Link to="/buyer/dashboard" className="font-playfair text-2xl font-bold text-[#95BF78]">
            TRACT
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/buyer/marketplace" className="font-inter text-base text-[#d0c5af] transition-colors hover:text-tract-gold">
              Listings
            </Link>
            <button
              type="button"
              className="font-inter text-base text-[#d0c5af] transition-colors hover:text-tract-gold"
              onClick={() => toast.message('Portfolio coming soon.')}
            >
              Portfolio
            </button>
            <button
              type="button"
              className="font-inter text-base text-[#d0c5af] transition-colors hover:text-tract-gold"
              onClick={() => toast.message('Insights coming soon.')}
            >
              Insights
            </button>
            <button
              type="button"
              className="font-inter text-base text-[#d0c5af] transition-colors hover:text-tract-gold"
              onClick={() => toast.message('Contact coming soon.')}
            >
              Contact
            </button>
          </nav>
          <Link
            to="/buyer/marketplace"
            className="rounded-lg bg-tract-gold px-4 py-2 font-inter text-sm font-semibold text-[#554300] transition-transform active:scale-95 hover:brightness-110"
          >
            Invest now
          </Link>
        </div>
      </header>

      <main className="px-4 pb-16 pt-28 md:px-12 md:pt-32">
        <div className="relative mx-auto mt-12 max-w-[600px] overflow-hidden rounded-[20px] bg-white p-8 shadow-lg md:mt-16 md:p-12">
          <div className="flex flex-col items-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-tract-green-light">
              <Check className="h-10 w-10 text-tract-green" strokeWidth={3} aria-hidden />
              <span className="absolute -left-2 -top-2 h-2 w-2 rounded-full bg-tract-gold" aria-hidden />
              <span className="absolute right-8 top-0 h-1.5 w-1.5 rounded-full bg-tract-rose" aria-hidden />
              <span className="absolute -bottom-2 left-6 h-1.5 w-1.5 rounded-full bg-yellow-600/80" aria-hidden />
              <span className="absolute -right-4 bottom-4 h-2 w-2 rounded-full bg-[#95BF78]" aria-hidden />
            </div>
            <h1 className="mt-4 text-center font-playfair text-3xl font-bold text-tract-obsidian">Deal closed successfully</h1>
            <p className="mt-2 text-center font-inter text-sm text-gray-500">{subtitle}</p>
          </div>

          <div className="my-8 h-px bg-gray-200" />

          <section>
            <h2 className="font-playfair text-xl font-bold text-tract-obsidian">Rate your experience</h2>
            <p className="mt-1 font-inter text-sm text-gray-500">
              Your rating is locked to this transaction. Only your counterparty can leave a review.
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#323538]">
                <img src={WHOLESALER_AVATAR} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-inter text-sm font-semibold text-tract-obsidian">{counterpartyName}</span>
                  <span className="rounded-full bg-tract-green-light px-2 py-0.5 font-inter text-[10px] font-bold uppercase tracking-wider text-tract-green">
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
                      n <= stars ? 'fill-tract-gold text-tract-gold' : 'fill-none text-tract-graphite',
                    )}
                    strokeWidth={n <= stars ? 0 : 1.5}
                    aria-hidden
                  />
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label htmlFor="rating-review" className="mb-1 block font-inter text-xs font-bold uppercase tracking-wider text-gray-500">
                Your review (optional)
              </label>
              <textarea
                id="rating-review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={5}
                placeholder="Describe your experience working with this wholesaler..."
                className="w-full resize-none rounded-lg border border-gray-200 bg-white p-4 font-inter text-base text-tract-obsidian placeholder:text-gray-500 focus:border-tract-gold focus:outline-none focus:ring-1 focus:ring-tract-gold"
              />
            </div>

            <div className="mt-8 rounded-xl bg-tract-green-light p-6">
              <span className="mb-3 block font-inter text-xs font-bold uppercase tracking-wider text-tract-green">
                Your profile has been updated
              </span>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-tract-green px-4 py-2 font-inter text-sm font-semibold text-white">
                  <TrendingUp className="h-4 w-4" strokeWidth={2} aria-hidden />
                  +1 deal closed
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-tract-green bg-white px-4 py-2 font-inter text-sm font-semibold text-tract-green">
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
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-lg bg-tract-green font-inter text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
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
                className="mt-4 w-full text-center font-inter text-sm text-gray-400 transition-colors hover:text-tract-obsidian"
              >
                Skip for now
              </button>
            </div>
          </section>

          <footer className="mt-8 text-center">
            <p className="mx-auto max-w-[400px] font-inter text-xs text-gray-400">
              Reviews are monitored for bad faith. Retaliatory reviews result in a 7-day platform suspension.
            </p>
          </footer>
        </div>
      </main>

      <footer className="mt-12 border-t border-[#323538] bg-[#191C1F] py-10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-12">
          <div className="font-playfair text-xl font-bold text-tract-gold">TRACT</div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Privacy policy', 'Terms of service', 'Legal notices', 'Regulatory disclosure'].map((label) => (
              <button
                key={label}
                type="button"
                className="font-inter text-sm text-[#d0c5af] transition-colors hover:text-white"
                onClick={() => toast.message('Link coming soon.')}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-center font-inter text-sm text-[#d0c5af]">
            © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
