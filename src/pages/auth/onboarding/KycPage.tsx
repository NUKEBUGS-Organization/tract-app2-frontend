import { useNavigate } from 'react-router-dom'
import OnboardingFooter from '@/components/auth/OnboardingFooter'
import OnboardingHeader from '@/components/auth/OnboardingHeader'
import KycVerificationPanel from '@/components/kyc/KycVerificationPanel'

export default function KycPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-tract-alabaster font-inter text-tract-obsidian">
      <OnboardingHeader currentStep={4} />

      <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-tract-graphite/10">
        <div className="h-full w-full bg-tract-green transition-all duration-1000" />
      </div>

      <main className="flex grow flex-col items-center px-4 pb-10 pt-[88px] md:px-0">
        <div className="mt-10 w-full max-w-[760px]">
          <section className="mb-8 text-center md:text-left">
            <h1 className="mb-2 font-playfair text-[36px] font-bold text-tract-obsidian">Verify Your Identity</h1>
            <p className="max-w-[600px] font-inter text-[16px] text-gray-500">
              TRACT requires government ID and a live selfie (Jumio). Bank linking is optional on the next step.
            </p>
          </section>

          <KycVerificationPanel variant="onboarding" className="mb-10" />

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => navigate('/register/bank')}
              className="flex h-14 w-full items-center justify-center rounded-lg bg-tract-gold font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-[#554300] shadow-sm transition-all hover:bg-yellow-500"
            >
              Continue to bank linking
            </button>

            <button
              type="button"
              onClick={() => navigate('/register/bank')}
              className="w-full text-center font-inter text-[14px] text-gray-400 underline underline-offset-4 transition-colors hover:text-tract-obsidian"
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
