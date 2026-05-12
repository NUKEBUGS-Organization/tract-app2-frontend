import { ArrowRight, Building2, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'

export default function BankPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-tract-alabaster font-inter text-tract-obsidian">
      <OnboardingHeader currentStep={4} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-gray-200">
        <div className="h-full w-full bg-tract-green transition-all duration-500" />
      </div>

      <main className="flex grow items-center justify-center px-4 py-10 md:px-12">
        <div className="w-full max-w-[560px]">
          <div className="mb-10 text-center">
            <h1 className="mb-3 font-playfair text-[36px] font-bold text-tract-obsidian">Link Your Bank Account</h1>
            <p className="font-inter text-[16px] text-gray-500">
              Required for platform fee processing. Your credentials are never stored.
            </p>
          </div>

          <div className="rounded-[12px] bg-white p-10 shadow-sm">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tract-gold/10">
                <Building2 className="h-8 w-8 text-tract-gold" strokeWidth={1.5} aria-hidden />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                // TODO: Initialize Plaid Link widget
                navigate('/register/complete')
              }}
              className="flex h-14 w-full items-center justify-center gap-3 bg-tract-gold font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600 active:scale-[0.98]"
            >
              <Lock className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              Connect Your Bank
            </button>

            <p className="mt-4 text-center font-inter text-[12px] text-gray-400">
              Secured by Plaid · 256-bit encryption · Bank-grade security
            </p>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="font-inter text-[12px] text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={() => navigate('/register/complete')}
              className="flex h-12 w-full items-center justify-center gap-2 border border-tract-graphite/20 bg-transparent font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-tract-graphite transition-all hover:border-tract-graphite hover:bg-tract-graphite hover:text-white"
            >
              Skip for now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>

            <p className="mt-3 text-center font-inter text-[11px] text-gray-400">
              You can link your bank later in Settings. Some features require a linked account.
            </p>
          </div>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
