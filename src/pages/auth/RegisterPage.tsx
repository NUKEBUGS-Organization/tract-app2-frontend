import type { LucideIcon } from 'lucide-react'
import { BadgeCheck, Handshake, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BackButton from '@/components/auth/BackButton'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import RoleCard from '@/components/auth/RoleCard'
import { useRegisterStore } from '@/store/registerStore'
import type { UserRole } from '@/types'

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
    <div className="flex min-h-screen flex-col bg-tract-alabaster font-inter">
      <OnboardingHeader
        currentStep={1}
        leading={<BackButton to="/login" label="Back to Sign In" className="mb-0 shrink-0" />}
      />

      <main className="flex grow items-center justify-center px-4 pb-10 pt-32">
        <div className="w-full max-w-[680px]">
          <div className="mb-10 text-center">
            <h1 className="mb-4 font-playfair text-[26px] font-bold leading-tight text-tract-obsidian md:text-[36px]">
              What best describes you?
            </h1>
            <p className="font-inter text-[16px] text-gray-500">
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
              className={[
                'flex h-14 w-full items-center justify-center font-inter text-[12px] font-bold',
                'uppercase tracking-[0.15em]',
                'transition-all duration-200 active:scale-[0.98]',
                role
                  ? 'cursor-pointer bg-tract-gold text-white hover:bg-yellow-600'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400',
              ].join(' ')}
            >
              Continue
            </button>

            <p className="text-center font-inter text-[13px] text-gray-400">
              Need help deciding?{' '}
              <a
                href="mailto:concierge@tract.com"
                className="underline decoration-2 decoration-tract-gold underline-offset-4 transition-colors hover:text-tract-gold"
              >
                Contact our concierge team
              </a>
            </p>
          </div>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
