import { ArrowRight, Building2, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'

export default function BankPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-app1-bg-main font-poppins text-app1-text-main">
      <OnboardingHeader currentStep={4} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-app1-border-light">
        <div className="h-full w-full bg-app1-primary transition-all duration-500" />
      </div>

      <main className="flex grow items-center justify-center px-4 py-10 md:px-12">
        <div className="w-full max-w-[560px]">
          <div className="mb-10 text-center">
            <h1 className="mb-3 font-cinzel text-[36px] font-black text-app1-primary">Link Your Bank Account</h1>
            <p className="font-poppins text-[16px] text-app1-text-muted">
              Required for platform fee processing. Your credentials are never stored.
            </p>
          </div>

          <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card md:p-10">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-app1-secondary/10">
                <Building2 className="h-8 w-8 text-app1-secondary" strokeWidth={1.5} aria-hidden />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                // TODO: Initialize Plaid Link widget
                navigate('/register/complete')
              }}
              className="flex h-14 w-full items-center justify-center gap-3 bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              Connect Your Bank
            </button>

            <p className="mt-4 text-center font-poppins text-[12px] text-app1-text-muted">
              Secured by Plaid · 256-bit encryption · Bank-grade security
            </p>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-app1-border-light" />
              <span className="font-poppins text-[12px] text-app1-text-muted">or</span>
              <div className="h-px flex-1 bg-app1-border-light" />
            </div>

            <button
              type="button"
              onClick={() => navigate('/register/complete')}
              className="flex h-12 w-full items-center justify-center gap-2 border border-app1-border-light bg-transparent font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-main transition-all hover:border-app1-primary hover:bg-app1-primary hover:text-white"
            >
              Skip for now
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>

            <p className="mt-3 text-center font-poppins text-[11px] text-app1-text-muted">
              You can link your bank later in Settings. Some features require a linked account.
            </p>
          </div>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
