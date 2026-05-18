import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import KycReminderBanner from '@/components/kyc/KycReminderBanner'
import type { UserRole } from '@/types'

function dashboardForRole(role: UserRole): string {
  switch (role) {
    case 'buyer':
      return '/buyer/dashboard'
    case 'wholesaler':
    case 'realtor':
    case 'seller':
      return '/wholesaler/dashboard'
    case 'title_rep':
      return '/title/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/buyer/dashboard'
  }
}

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardForRole(user.role)} replace />
  }

  const showKycBanner =
    user != null &&
    user.role !== 'admin' &&
    user.kycStatus !== 'approved'

  return (
    <>
      {showKycBanner ? (
        <>
          <div className="fixed left-0 right-0 top-0 z-[100]">
            <KycReminderBanner />
          </div>
          {/* Reserve space below fixed banner so content isn't hidden */}
          <div className="h-11 w-full shrink-0" aria-hidden />
        </>
      ) : null}
      {children}
    </>
  )
}
