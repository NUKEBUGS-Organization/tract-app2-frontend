const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

interface GoogleAuthButtonProps {
  label?: string
}

export default function GoogleAuthButton({ label = 'Continue with Google' }: GoogleAuthButtonProps) {
  return (
    <a
      href={`${apiBase}/auth/google`}
      className="flex h-14 w-full items-center justify-center gap-3 rounded-lg border border-app1-border-light bg-app1-bg-card font-poppins text-[13px] font-bold text-app1-text-main transition-all hover:scale-[1.02] hover:border-app1-secondary/50 active:scale-[0.98]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.08 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12A12 12 0 0 0 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.27a12 12 0 0 0 0 10.78z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.12C6.22 6.88 8.87 4.77 12 4.77z"
        />
      </svg>
      {label}
    </a>
  )
}
