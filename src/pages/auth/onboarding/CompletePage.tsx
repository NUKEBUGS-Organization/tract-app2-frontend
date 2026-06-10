import { Check, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useRegisterStore } from '@/store/registerStore'
import type { UserRole } from '@/types'

function marketplacePath(role: UserRole | null): string {
  switch (role) {
    case 'wholesaler':
      return '/wholesaler/dashboard'
    case 'buyer':
      return '/buyer/marketplace'
    case 'realtor':
      return '/buyer/marketplace'
    case 'seller':
      return '/wholesaler/listings'
    case 'title_rep':
      return '/title/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/buyer/marketplace'
  }
}

function dashboardPath(role: UserRole | null): string {
  switch (role) {
    case 'wholesaler':
    case 'realtor':
      return '/wholesaler/dashboard'
    case 'buyer':
      return '/buyer/dashboard'
    case 'seller':
      return '/wholesaler/dashboard'
    case 'title_rep':
      return '/title/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/wholesaler/dashboard'
  }
}

function verifiedRoleLabel(role: UserRole | null): string {
  switch (role) {
    case 'seller':
      return 'Verified Seller'
    case 'wholesaler':
      return 'Verified Wholesaler'
    case 'realtor':
      return 'Verified Realtor'
    case 'buyer':
      return 'Verified Buyer'
    case 'title_rep':
      return 'Verified Title Representative'
    case 'admin':
      return 'Verified Administrator'
    default:
      return 'Verified Member'
  }
}

export default function CompletePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const role = (user?.role ?? null) as UserRole | null
  const [pending, setPending] = useState<'marketplace' | 'dashboard' | null>(null)

  const activeDeals = user?.app2_activeDealsCount ?? 0
  const reliabilityScore = user?.reliabilityScore ?? 100

  const chipLabel = useMemo(() => verifiedRoleLabel(role), [role])

  const go = (target: 'marketplace' | 'dashboard') => {
    setPending(target)
    useRegisterStore.getState().reset()
    const path = target === 'marketplace' ? marketplacePath(role) : dashboardPath(role)
    navigate(path)
  }

  return (
    <div className="tract-obsidian-grid flex min-h-screen flex-col font-inter text-gray-200">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-tract-graphite/40 bg-tract-obsidian/80 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-12">
          <span className="font-playfair text-[28px] font-bold text-tract-gold">TRACT</span>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-4 md:gap-8">
            <span className="font-inter text-[12px] font-bold uppercase tracking-widest text-gray-400">
              STEP 4 OF 4
            </span>
            <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/buyer/marketplace"
              className="font-inter text-[16px] text-gray-400 transition-colors duration-200 hover:text-tract-gold"
            >
              Listings
            </Link>
            <Link
              to="/buyer/dashboard"
              className="font-inter text-[16px] text-gray-400 transition-colors duration-200 hover:text-tract-gold"
            >
              Portfolio
            </Link>
            <a
              href="/wholesaler/dashboard"
              className="font-inter text-[16px] text-gray-400 transition-colors duration-200 hover:text-tract-gold"
            >
              Insights
            </a>
            <a
              href="mailto:support@tract.com"
              className="font-inter text-[16px] text-gray-400 transition-colors duration-200 hover:text-tract-gold"
            >
              Contact
            </a>
            </div>
            <button
              type="button"
              aria-label="Invest now"
              onClick={() => go('marketplace')}
              className="bg-tract-gold px-6 py-2 font-inter text-[14px] font-semibold text-[#554300] transition-transform duration-200 active:scale-95"
            >
              Invest Now
            </button>
          </div>
        </nav>
      </header>

      <main className="mt-16 flex grow items-center justify-center px-4 py-10 md:px-12">
        <div className="flex w-full max-w-[560px] flex-col items-center text-center">
          <div
            className="tract-check-in mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-tract-green shadow-lg"
            aria-hidden
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </div>

          <h1 className="mb-4 font-playfair text-[56px] font-bold leading-tight text-tract-alabaster">
            You&apos;re Verified.
          </h1>
          <p className="mb-6 max-w-md font-inter text-[18px] leading-relaxed tracking-wide text-gray-400">
            Welcome to TRACT. Your account is active and ready.
          </p>

          <div className="mb-12 flex items-center rounded-full border border-tract-gold bg-tract-graphite px-4 py-1.5">
            <span className="mr-2 h-2 w-2 rounded-full bg-tract-gold" aria-hidden />
            <span className="font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-tract-gold">
              {chipLabel}
            </span>
          </div>

          <div className="mb-12 grid w-full grid-cols-3 border-y border-tract-graphite/50 py-6">
            <div className="flex flex-col items-center px-3">
              <span className="mb-1 font-playfair text-[36px] font-bold text-tract-gold">{activeDeals}</span>
              <span className="font-inter text-[14px] text-gray-400">Active Deals</span>
            </div>
            <div className="flex flex-col items-center border-l border-tract-graphite/50 px-3">
              <span className="mb-1 font-playfair text-[36px] font-bold text-tract-gold">{reliabilityScore}</span>
              <span className="font-inter text-[14px] text-gray-400">Reliability Score</span>
            </div>
            <div className="flex flex-col items-center border-l border-tract-graphite/50 px-3">
              <span className="mb-1 font-playfair text-[36px] font-bold text-tract-green">Verified</span>
              <span className="font-inter text-[14px] text-gray-400">Account Status</span>
            </div>
          </div>

          <button
            type="button"
            disabled={pending !== null}
            aria-busy={pending === 'marketplace'}
            onClick={() => go('marketplace')}
            className="tract-shimmer-gold mb-4 flex h-[60px] w-full max-w-[400px] items-center justify-center font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-tract-obsidian transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-80"
          >
            {pending === 'marketplace' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              'Enter the Marketplace'
            )}
          </button>

          <button
            type="button"
            disabled={pending !== null}
            onClick={() => go('dashboard')}
            className="inline-flex items-center gap-2 font-inter text-[14px] text-gray-500 transition-colors hover:text-white hover:underline disabled:opacity-50"
            aria-label="Go to dashboard instead"
          >
            {pending === 'dashboard' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              'Go to Dashboard instead →'
            )}
          </button>
        </div>
      </main>

      <footer className="border-t border-tract-graphite/40 bg-tract-graphite">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 px-5 py-10 md:flex-row md:px-12">
          <div className="font-playfair text-[20px] font-bold text-tract-gold">TRACT</div>
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="/legal/privacy" className="font-inter text-[14px] text-gray-400 transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="/legal/terms" className="font-inter text-[14px] text-gray-400 transition-colors hover:text-white">
              Terms of Service
            </a>
            <a href="/legal/terms" className="font-inter text-[14px] text-gray-400 transition-colors hover:text-white">
              Legal Notices
            </a>
            <a href="/legal/terms" className="font-inter text-[14px] text-gray-400 transition-colors hover:text-white">
              Regulatory Disclosure
            </a>
          </nav>
          <p className="text-center font-inter text-[14px] text-gray-400 md:text-right">
            © 2024 TRACT Private Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
