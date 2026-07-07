import { CreditCard, FileText, HelpCircle, LayoutDashboard, LogOut, ShieldCheck, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useSidebarClose } from '@/contexts/SidebarContext'
import { cn } from '@/lib/utils'
import { disconnectSocket } from '@/hooks/useSocket'

const linkBase = 'flex items-center gap-3 px-6 py-3 ' + 'transition-all border-l-[3px]'

const inactive = 'border-transparent text-white/60 ' + 'hover:bg-white/10 hover:text-white font-medium'

const active = 'border-tract-gold bg-white/10 ' + 'text-tract-gold font-bold'

const NAV_ITEMS = [
  {
    to: '/title/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/title/deals',
    label: 'Active Deals',
    icon: FileText,
  },
  {
    to: '/title/emds',
    label: 'Pending EMDs',
    icon: CreditCard,
  },
  {
    to: '/settings/kyc',
    label: 'Verify Identity',
    icon: ShieldCheck,
  },
  {
    to: '/support',
    label: 'Support',
    icon: HelpCircle,
  },
] as const

export default function TitleRepSidebar() {
  const navigate = useNavigate()
  const closeSidebar = useSidebarClose()
  const { user, logout } = useAuthStore()
  const firstName = user?.fullName?.split(/\s+/)[0] ?? 'Sarah'
  const initial = firstName.slice(0, 1).toUpperCase()

  const handleLogout = () => {
    disconnectSocket()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-theme-border bg-tract-green">
      <div className="px-6 py-8">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="font-playfair text-[22px] font-bold text-white">TRACT</h1>
            <p className="mt-1 font-inter text-[10px] font-bold uppercase tracking-widest text-white/50">
              Title Representative
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
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) => cn(linkBase, isActive ? active : inactive)}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="font-inter text-[12px] font-bold uppercase tracking-wider">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-inter text-xs font-bold text-white">
            {initial}
          </div>
          <div className="flex flex-col">
            <span className="font-inter text-sm font-semibold text-white/90">{firstName}</span>
            <span className="font-inter text-[10px] font-bold uppercase text-white/50">Title Rep</span>
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
