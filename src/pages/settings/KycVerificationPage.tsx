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
    <div className="min-h-screen bg-tract-alabaster px-4 pb-16 pt-8 font-inter text-tract-obsidian md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to={back}
          className="mb-8 inline-flex items-center gap-2 font-inter text-sm text-gray-500 hover:text-tract-obsidian"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to dashboard
        </Link>
        <h1 className="mb-8 font-playfair text-4xl font-bold">Verify identity</h1>
        <KycVerificationPanel variant="settings" />
      </div>
    </div>
  )
}
