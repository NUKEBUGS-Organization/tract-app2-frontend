export default function OnboardingFooter() {
  return (
    <footer className="bg-tract-graphite px-12 py-6">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between md:flex-row">
        <p className="mb-4 font-inter text-[12px] text-gray-400/60 md:mb-0">
          © {new Date().getFullYear()} TRACT Private Marketplace. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="/legal/terms" className="font-inter text-[12px] text-gray-400/60 transition-colors hover:text-white">
            Terms of Service
          </a>
          <a href="/legal/privacy" className="font-inter text-[12px] text-gray-400/60 transition-colors hover:text-white">
            Privacy Policy
          </a>
          <a href="/legal/nda" className="font-inter text-[12px] text-gray-400/60 transition-colors hover:text-white">
            NDA
          </a>
          <a href="/legal/terms" className="font-inter text-[12px] text-gray-400/60 transition-colors hover:text-white">
            Legal Notices
          </a>
        </div>
      </div>
    </footer>
  )
}
