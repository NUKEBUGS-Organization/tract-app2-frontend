import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

export default function KycReminderBanner() {
  return (
    <div role="banner" className="flex h-11 w-full shrink-0 items-center justify-center gap-2 bg-amber-900 px-3 text-[13px] text-white shadow-md">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-200" aria-hidden />
      <span className="truncate text-center font-inter">
        Please verify your identity to use marketplace actions.
      </span>
      <Link
        to="/settings/kyc"
        className="shrink-0 font-inter font-semibold underline decoration-amber-200 underline-offset-2 hover:text-amber-100"
      >
        Verify now
      </Link>
    </div>
  )
}
