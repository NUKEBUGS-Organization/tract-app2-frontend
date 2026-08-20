import type { ElementType } from 'react'
import {
  CircleUser,
  FileText,
  Gavel,
  Handshake,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Shield,
  Store,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSidebarClose } from '@/contexts/SidebarContext'
import { isKycEnabled } from '@/lib/kyc'
import { cn, userFirstName } from '@/lib/utils'
import { disconnectSocket } from '@/hooks/useSocket'
import BrandMark from '@/components/brand/BrandMark'

const linkBase =
  'flex items-center gap-3 rounded-r-lg px-3 py-2.5 ' + 'transition-all duration-200 border-l-4'

const inactive = 'border-transparent text-white/60 ' + 'hover:bg-white/10 hover:text-white font-medium'

const active = 'border-tract-gold bg-white/10 ' + 'text-tract-gold font-bold'

interface NavItem {
  to: string | null
  label: string
  icon: ElementType
  href?: string
}

const BUYER_NAV: NavItem[] = [
  { to: '/buyer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/buyer/marketplace', label: 'Browse Marketplace', icon: Store },
  { to: '/buyer/bids', label: 'My Bids', icon: Gavel },
  { to: '/buyer/deals', label: 'Active Deals', icon: Handshake },
  { to: '/buyer/history', label: 'History', icon: History },
  { to: '/buyer/proof-of-funds', label: 'Proof of Funds', icon: FileText },
  ...(isKycEnabled
    ? [{ to: '/settings/kyc', label: 'Verify identity', icon: Shield } satisfies NavItem]
    : []),
  { to: '/buyer/profile', label: 'Profile & Score', icon: CircleUser },
  { to: '/support', label: 'Support', icon: HelpCircle },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const closeSidebar = useSidebarClose()
  const { user, logout } = useAuthStore()
  const firstName = userFirstName(user)
  const displayName = firstName || user?.email?.split('@')[0] || ''
  const initial = (displayName || '?').slice(0, 1).toUpperCase()
  const navItems = BUYER_NAV

  const handleLogout = () => {
    disconnectSocket()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-theme-border bg-theme-sidebar text-[color:var(--color-sidebar-text)] transition-colors duration-200">
      <div className="px-6 py-8">
        <div className="flex items-start justify-between gap-2">
          <BrandMark variant="sidebar" />
          <button
            type="button"
            onClick={closeSidebar}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="grow overflow-y-auto px-2">
        <ul className="space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, href }) =>
            to ? (
              <li key={label}>
                <NavLink
                  to={to}
                  end={to === '/buyer/dashboard'}
                  onClick={closeSidebar}
                  className={({ isActive }) => cn(linkBase, isActive ? active : inactive)}
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="font-inter text-[12px] font-bold uppercase tracking-wider">{label}</span>
                </NavLink>
              </li>
            ) : href ? (
              <li key={label}>
                <a href={href} className={cn(linkBase, inactive)}>
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="font-inter text-[12px] font-bold uppercase tracking-wider">{label}</span>
                </a>
              </li>
            ) : null,
          )}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 font-inter text-xs font-bold text-white">
            {initial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-inter text-sm font-semibold text-white/90">{displayName}</span>
            <span className="mt-0.5 w-fit rounded bg-white/10 px-1 font-inter text-[10px] font-bold uppercase tracking-tighter text-white/80">
              {user?.role ?? 'Buyer'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 font-inter text-sm text-white/70 transition-colors hover:text-tract-red"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          Logout
        </button>
      </div>
    </aside>
  )
}
