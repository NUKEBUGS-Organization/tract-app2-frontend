import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import NotificationBell from '@/components/layout/NotificationBell'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import type { UserRole } from '@/types'

function workspaceLabel(role?: UserRole | null): string {
  switch (role) {
    case 'wholesaler':
    case 'realtor':
      return 'Wholesaler Workspace'
    case 'buyer':
      return 'Buyer Workspace'
    case 'title_rep':
      return 'Title Workspace'
    case 'admin':
      return 'Admin Workspace'
    default:
      return 'TRACT Workspace'
  }
}

export default function DashboardToolbar() {
  const user = useAuthStore((s) => s.user)
  const proMode = useUiStore((s) => s.proMode)
  const toggleProMode = useUiStore((s) => s.toggleProMode)

  return (
    <div className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-app1-border-light bg-app1-bg-card px-6 transition-colors duration-200 md:px-12 lg:flex">
      <p className="font-poppins text-[11px] font-black uppercase tracking-[0.22em] text-app1-text-muted">
        {workspaceLabel(user?.role)}
      </p>

      <div className="flex items-center gap-4 md:gap-6">
        <Link
          to="/support"
          className="inline-flex items-center gap-2 rounded-lg border border-app1-border-light bg-app1-bg-soft px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-main transition-colors hover:border-app1-secondary/40 hover:text-app1-secondary"
        >
          <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
          Support
        </Link>

        <NotificationBell />

        <div className="flex items-center gap-2 rounded-full border border-app1-border-light bg-app1-bg-soft py-0.5 pl-2 pr-1">
          <span className="font-poppins text-[10px] font-black uppercase tracking-wider text-app1-text-muted">
            {proMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={proMode}
            aria-label="Toggle dark mode"
            onClick={toggleProMode}
            className={cn(
              'relative h-4 w-8 rounded-full transition-colors',
              proMode ? 'bg-app1-secondary' : 'bg-gray-400',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-3 w-3 rounded-full bg-app1-primary-dark transition-all',
                proMode ? 'right-0.5' : 'left-0.5',
              )}
            />
          </button>
        </div>

        <div className="h-9 w-9 overflow-hidden rounded-full border border-app1-border-light bg-app1-bg-soft">
          <img src={DEFAULT_AVATAR_IMAGE} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
