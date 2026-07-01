import { useNavigate } from 'react-router-dom'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import KycVerificationPanel from '@/components/kyc/KycVerificationPanel'

export default function KycPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-app1-bg-main font-poppins text-app1-text-main">
      <OnboardingHeader currentStep={4} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-app1-border-light">
        <div className="h-full w-full bg-app1-primary transition-all duration-1000" />
      </div>

      <main className="flex grow flex-col items-center px-4 pb-10 pt-[88px] md:px-0">
        <div className="mt-10 w-full max-w-[760px]">
          <section className="mb-8 text-center md:text-left">
            <h1 className="mb-2 font-cinzel text-[36px] font-black text-app1-primary">Verify Your Identity</h1>
            <p className="max-w-[600px] font-poppins text-[16px] text-app1-text-muted">
              TRACT requires government ID and a live selfie (Jumio). Bank linking is optional on the next step.
            </p>
          </section>

          <div className="mb-10 rounded-app1-card border border-app1-border-light bg-app1-bg-card p-6 shadow-app1-card md:p-8">
            <KycVerificationPanel variant="onboarding" className="mb-0" />
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => navigate('/register/bank')}
              className="flex h-14 w-full items-center justify-center rounded-lg bg-app1-secondary font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-primary-dark shadow-sm transition-all hover:scale-[1.02]"
            >
              Continue to bank linking
            </button>

            <button
              type="button"
              onClick={() => navigate('/register/bank')}
              className="w-full text-center font-poppins text-[14px] text-app1-text-muted underline underline-offset-4 transition-colors hover:text-app1-text-main"
            >
              Skip for now — I&apos;ll verify later in Profile
            </button>
          </div>
        </div>
      </main>

      <OnboardingFooter />
    </div>
  )
}
