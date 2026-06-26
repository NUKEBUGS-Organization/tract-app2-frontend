import {
  Activity,
  FileText,
  Gavel,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  UserSearch,
  ShieldCheck,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSidebarClose } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'

const navLinkClass =
  'flex items-center gap-4 px-6 py-4 font-inter text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white'

const navActive =
  'border-l-4 border-tract-gold bg-white/10 text-tract-gold font-semibold'

export default function WholesalerSidebar() {
  const navigate = useNavigate()
  const closeSidebar = useSidebarClose()
  const { user, logout } = useAuthStore()
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Marcus'
  const initial = firstName.slice(0, 1).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-theme-border bg-tract-green transition-colors duration-200">
      <div className="px-6 py-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-playfair text-[24px] font-bold text-white">TRACT</h1>
            <p className="mt-1 font-inter text-[11px] font-bold uppercase tracking-widest text-white/50">
              Marketplace Engine
            </p>
          </div>
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

      <nav className="grow overflow-y-auto">
        <ul className="space-y-0.5">
          <li>
            <NavLink
              to="/wholesaler/dashboard"
              end
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
              onClick={closeSidebar}
            >
              <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/wholesaler/listings" className={({ isActive }) => cn(navLinkClass, isActive && navActive)}>
              <FileText className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              My Contracts
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/wholesaler/listings/new"
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
              onClick={closeSidebar}
            >
              <Store className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Create Listing
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/wholesaler/bids"
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
              onClick={closeSidebar}
            >
              <Gavel className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              My Bids
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/wholesaler/deals"
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
              onClick={closeSidebar}
            >
              <Activity className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Deal Tracker
            </NavLink>
          </li>
          <li>
            <NavLink to="/wholesaler/score" className={({ isActive }) => cn(navLinkClass, isActive && navActive)}>
              <UserSearch className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Score &amp; Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings/kyc" className={({ isActive }) => cn(navLinkClass, isActive && navActive)}>
              <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Verify identity
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/wholesaler/settings"
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
              onClick={closeSidebar}
            >
              <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Settings
            </NavLink>
          </li>
          <li>
            <a href="mailto:support@tract.com" className={navLinkClass}>
              <HelpCircle className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Support
            </a>
          </li>
        </ul>
      </nav>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 font-inter text-xs font-bold text-white">
            {initial}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-inter text-sm font-semibold text-white/90">{firstName}</span>
            <span className="mt-0.5 w-fit rounded bg-white/10 px-1 font-inter text-[10px] font-bold uppercase tracking-tighter text-white/80">
              {user?.role === 'realtor' ? 'Realtor' : 'Wholesaler'}
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
