type Props = {
  variant?: 'onboarding' | 'settings'
  className?: string
}

export default function KycVerificationPanel(_props: Props) {
  return (
    <div className="rounded-[12px] border border-gray-100 bg-white p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tract-green-light mx-auto">
        <svg
          className="h-7 w-7 text-tract-green"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286z"
          />
        </svg>
      </div>
      <h3 className="font-playfair text-[20px] font-bold text-tract-obsidian mb-2">
        Identity Verification
      </h3>
      <p className="font-inter text-[14px] text-gray-500 mb-2">
        Jumio KYC integration coming soon.
      </p>
      <p className="font-inter text-[12px] text-gray-400">
        Your account is pending verification. You will be notified when this feature is available.
      </p>
    </div>
  )
}
