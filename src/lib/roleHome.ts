import type { UserRole } from '@/types'

export function normalizePortalRole(role: UserRole | string | null | undefined): UserRole | string | null | undefined {
  switch (role) {
    case 'partner':
    case 'private_partner':
      return 'wholesaler'
    case 'licensed':
    case 'licensed_partner':
      return 'realtor'
    default:
      return role
  }
}

/** Dashboard home for a role after login / wrong-route redirect. */
export function roleHomePath(role: UserRole | string | null | undefined): string {
  switch (normalizePortalRole(role)) {
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
  const normalizedRole = normalizePortalRole(role)
  return normalizedRole === 'wholesaler' || normalizedRole === 'realtor' || normalizedRole === 'seller'
}

export function listerBasePath(role: UserRole | string | null | undefined): string {
  return normalizePortalRole(role) === 'realtor' ? '/realtor' : '/wholesaler'
}
