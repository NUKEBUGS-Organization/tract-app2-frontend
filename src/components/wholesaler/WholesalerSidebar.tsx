import {
  Activity,
  FileText,
  Gavel,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
  UserSearch,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navLinkClass =
  'flex items-center gap-4 px-6 py-4 font-inter text-sm text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white'

const navActive =
  'border-l-4 border-tract-gold bg-white/10 text-tract-gold font-semibold'

export default function WholesalerSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Marcus'
  const initial = firstName.slice(0, 1).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-tract-green/20 bg-tract-green">
      <div className="px-6 py-10">
        <h1 className="font-playfair text-[24px] font-bold text-white">TRACT</h1>
        <p className="mt-1 font-inter text-[11px] font-bold uppercase tracking-widest text-white/50">
          Marketplace Engine
        </p>
      </div>

      <nav className="grow overflow-y-auto">
        <ul className="space-y-0.5">
          <li>
            <NavLink
              to="/wholesaler/dashboard"
              end
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
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
            >
              <Store className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Create Listing
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/wholesaler/bids"
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
            >
              <Gavel className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              My Bids
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/wholesaler/deals"
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
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
            <NavLink
              to="/wholesaler/settings"
              className={({ isActive }) => cn(navLinkClass, isActive && navActive)}
            >
              <Settings className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
              Settings
            </NavLink>
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
              Wholesaler
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
