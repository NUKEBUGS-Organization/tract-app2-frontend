import type { UserRole } from '@/types'

/** Dashboard home for a role after login / wrong-route redirect. */
export function roleHomePath(role: UserRole | string | null | undefined): string {
  switch (role) {
    case 'buyer':
      return '/buyer/dashboard'
    case 'realtor':
      return '/realtor/dashboard'
    case 'wholesaler':
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

/** App 2 list-only roles (no marketplace / bid). */
export function isListerRole(role: UserRole | string | null | undefined): boolean {
  return role === 'wholesaler' || role === 'realtor' || role === 'seller'
}

export function listerBasePath(role: UserRole | string | null | undefined): string {
  return role === 'realtor' ? '/realtor' : '/wholesaler'
}
