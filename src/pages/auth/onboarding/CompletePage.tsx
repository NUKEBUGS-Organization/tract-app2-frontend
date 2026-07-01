import { Check, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins text-app1-text-main">
      <main className="flex grow items-center justify-center px-4 py-10 md:px-12">
        <div className="flex w-full max-w-[560px] flex-col items-center rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 text-center shadow-app1-card md:p-12">
          <div
            className="mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-app1-primary shadow-lg"
            aria-hidden
          >
            <Check className="h-12 w-12 text-white" strokeWidth={3} />
          </div>

          <h1 className="mb-4 font-cinzel text-[40px] font-black leading-tight text-app1-primary md:text-[48px]">
            You&apos;re Verified.
          </h1>
          <p className="mb-6 max-w-md font-poppins text-[18px] leading-relaxed text-app1-text-muted">
            Welcome to TRACT. Your account is active and ready.
          </p>

          <div className="mb-12 flex items-center rounded-full border border-app1-secondary/30 bg-app1-secondary/10 px-4 py-1.5">
            <span className="mr-2 h-2 w-2 rounded-full bg-app1-secondary" aria-hidden />
            <span className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-secondary">
              {chipLabel}
            </span>
          </div>

          <div className="mb-12 grid w-full grid-cols-3 border-y border-app1-border-light py-6">
            <div className="flex flex-col items-center px-3">
              <span className="mb-1 font-cinzel text-[36px] font-black text-app1-secondary">{activeDeals}</span>
              <span className="font-poppins text-[14px] text-app1-text-muted">Active Deals</span>
            </div>
            <div className="flex flex-col items-center border-l border-app1-border-light px-3">
              <span className="mb-1 font-cinzel text-[36px] font-black text-app1-secondary">{reliabilityScore}</span>
              <span className="font-poppins text-[14px] text-app1-text-muted">Reliability Score</span>
            </div>
            <div className="flex flex-col items-center border-l border-app1-border-light px-3">
              <span className="mb-1 font-cinzel text-[36px] font-black text-app1-primary">Verified</span>
              <span className="font-poppins text-[14px] text-app1-text-muted">Account Status</span>
            </div>
          </div>

          <button
            type="button"
            disabled={pending !== null}
            aria-busy={pending === 'marketplace'}
            onClick={() => go('marketplace')}
            className="mb-4 flex h-[60px] w-full max-w-[400px] items-center justify-center bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:hover:scale-100"
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
            className="inline-flex items-center gap-2 font-poppins text-[14px] text-app1-text-muted transition-colors hover:text-app1-primary hover:underline disabled:opacity-50"
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

      <footer className="border-t border-app1-border-light bg-app1-bg-card py-6">
        <p className="text-center font-poppins text-[12px] text-app1-text-muted">
          © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
