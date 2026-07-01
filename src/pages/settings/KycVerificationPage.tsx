import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import KycVerificationPanel from '@/components/kyc/KycVerificationPanel'

const ROLE_HOME: Record<string, string> = {
  wholesaler: '/wholesaler/dashboard',
  realtor: '/wholesaler/dashboard',
  buyer: '/buyer/dashboard',
  title_rep: '/title/dashboard',
  admin: '/admin/dashboard',
}

export default function KycVerificationPage() {
  const user = useAuthStore((s) => s.user)
  const back = user ? ROLE_HOME[user.role] ?? '/buyer/dashboard' : '/login'

  return (
    <div className="min-h-screen bg-app1-bg-main px-4 pb-16 pt-8 font-poppins text-app1-text-main md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to={back}
          className="mb-8 inline-flex items-center gap-2 font-poppins text-sm text-app1-text-muted hover:text-app1-text-main"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>

        <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-8 shadow-app1-card">
          <h1 className="mb-8 font-cinzel text-4xl font-black text-app1-primary">Verify identity</h1>
          <KycVerificationPanel variant="settings" />
        </div>
      </div>
    </div>
  )
}
