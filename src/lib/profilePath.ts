import type { UserRole } from '@/types'

/** Route for the signed-in user's profile / settings surface. */
export function profilePathForRole(role?: UserRole | null): string {
  switch (role) {
    case 'buyer':
      return '/buyer/profile'
    case 'wholesaler':
    case 'realtor':
      return '/wholesaler/settings'
    case 'title_rep':
      return '/title/dashboard'
    case 'admin':
      return '/admin/dashboard'
    default:
      return '/buyer/profile'
  }
}
