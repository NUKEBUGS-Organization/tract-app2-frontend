import type { ReactNode } from 'react'

interface OnboardingHeaderProps {
  currentStep: 1 | 2 | 3 | 4
  leading?: ReactNode
}

export default function OnboardingHeader({ currentStep, leading }: OnboardingHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-tract-graphite/10 bg-white">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          {leading}
          <span className="font-playfair text-[28px] font-bold text-tract-green">TRACT</span>
        </div>
        <span className="shrink-0 font-inter text-[12px] font-bold uppercase tracking-widest text-gray-400">
          STEP {currentStep} OF 4
        </span>
      </div>
    </header>
  )
}
