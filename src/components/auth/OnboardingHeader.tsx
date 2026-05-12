interface OnboardingHeaderProps {
  currentStep: 1 | 2 | 3 | 4
}

export default function OnboardingHeader({ currentStep }: OnboardingHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-tract-graphite/10 bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-12">
        <span className="font-playfair text-[28px] font-bold text-tract-green">TRACT</span>
        <span className="font-inter text-[12px] font-bold uppercase tracking-[0.05em] text-gray-400">
          Step {currentStep} of 4
        </span>
      </div>
    </header>
  )
}
