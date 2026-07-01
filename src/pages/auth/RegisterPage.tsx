import type { LucideIcon } from 'lucide-react'
import { BadgeCheck, Handshake, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@/components/auth/BackButton'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import RoleCard from '@/components/auth/RoleCard'
import { useRegisterStore } from '@/store/registerStore'
import type { UserRole } from '@/types'
import { cn } from '@/lib/utils'

const ROLES: {
  value: UserRole
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    value: 'buyer',
    icon: ShoppingBag,
    title: "I'm a Buyer",
    description: 'I want to purchase wholesale properties',
  },
  {
    value: 'wholesaler',
    icon: Handshake,
    title: "I'm a Wholesaler",
    description: 'I want to list and wholesale deals',
  },
  {
    value: 'realtor',
    icon: BadgeCheck,
    title: "I'm a Licensed Realtor",
    description: 'I represent buyers or transactions in my state',
  },
]

export default function RegisterPage() {
  const { role, setRole } = useRegisterStore()
  const navigate = useNavigate()

  const handleContinue = () => {
    if (!role) return
    navigate('/register/details')
  }

  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main px-4 py-8 font-poppins">
      <OnboardingHeader
        currentStep={1}
        leading={<BackButton to="/login" label="Back to Sign In" className="mb-0 shrink-0" />}
      />

      <main className="flex grow items-center justify-center pb-10 pt-24 md:pt-32">
        <div className="w-full max-w-[480px] md:max-w-[680px]">
          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card md:p-10">
            <div className="mb-10 text-center">
              <h1 className="mb-4 font-cinzel text-[26px] font-black leading-tight text-app1-primary md:text-[36px]">
                What best describes you?
              </h1>
              <p className="font-poppins text-[16px] text-app1-text-muted">
                Your role determines what you can see and do on TRACT.
              </p>
            </div>

            <div className="mb-10 space-y-4">
              {ROLES.map((r) => (
                <RoleCard
                  key={r.value}
                  icon={r.icon}
                  title={r.title}
                  description={r.description}
                  selected={role === r.value}
                  onClick={() => setRole(r.value)}
                />
              ))}
            </div>

            <div className="space-y-6">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!role}
                aria-disabled={!role}
                className={cn(
                  'flex h-14 w-full items-center justify-center font-poppins text-[11px] font-black uppercase tracking-[0.16em] transition-all duration-200 active:scale-[0.98]',
                  role
                    ? 'cursor-pointer bg-app1-secondary text-app1-primary-dark hover:scale-[1.02]'
                    : 'cursor-not-allowed bg-app1-bg-soft text-app1-text-muted',
                )}
              >
                Continue
              </button>

              <p className="text-center font-poppins text-[13px] text-app1-text-muted">
                Need help deciding?{' '}
                <a
                  href="mailto:concierge@tract.com"
                  className="underline decoration-2 decoration-app1-secondary underline-offset-4 transition-colors hover:text-app1-secondary"
                >
                  Contact our concierge team
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
