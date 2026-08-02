import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { isKycEnabled } from '@/lib/kyc'
import { roleHomePath } from '@/lib/roleHome'

/** When VITE_KYC_ENABLED is off, bounce away from KYC surfaces. */
export function KycRouteGuard({
  children,
  fallback = 'home',
}: {
  children: React.ReactNode
  fallback?: 'home' | 'register-bank'
}) {
  const role = useAuthStore((s) => s.user?.role)
  if (isKycEnabled) return children
  if (fallback === 'register-bank') {
    return <Navigate to="/register/bank" replace />
  }
  return <Navigate to={roleHomePath(role)} replace />
}
