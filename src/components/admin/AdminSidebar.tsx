import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Network,
  Users,
  Wallet,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { disconnectSocket } from '@/hooks/useSocket'

const linkBase = 'flex items-center px-6 py-3 transition-all ' + 'border-l-[3px] group'

const inactive =
  'border-transparent text-gray-400 font-medium ' + 'hover:bg-[#1D2023] hover:text-gray-100'

const active = 'border-tract-gold bg-[#272A2E] ' + 'font-semibold text-tract-gold'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/verification-queue', label: 'Verification Queue', icon: BadgeCheck },
  { to: '/admin/penalty-log', label: 'Penalty Log', icon: AlertTriangle },
  { to: '/admin/chat-surveillance', label: 'Chat Surveillance', icon: MessageSquare },
  { to: '/admin/financial-ledger', label: 'Financial Ledger', icon: Wallet },
  { to: null, label: 'All Deals', icon: Building2 },
  { to: null, label: 'Pending Listings', icon: ClipboardList },
  { to: null, label: 'State Firewall', icon: Network },
  { to: null, label: 'User Management', icon: Users },
  { to: null, label: 'Support', icon: HelpCircle, href: 'mailto:support@tract.com' },
] as const

export default function AdminSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const displayName = user?.fullName?.trim() || 'Administrator'

  const handleLogout = () => {
    disconnectSocket()
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-tract-graphite bg-tract-obsidian">
      <div className="border-b border-tract-graphite/30 px-6 py-8">
        <h1 className="font-playfair text-[20px] font-bold tracking-tight text-tract-alabaster">TRACT Admin</h1>
        <p className="mt-1 font-inter text-[10px] font-bold uppercase tracking-widest text-gray-500">
          App 2 Control Center
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => {
          const href = 'href' in rest ? rest.href : undefined
          return to ? (
            <NavLink
              key={label}
              to={to}
              end={to === '/admin/dashboard'}
              className={({ isActive }) => cn(linkBase, isActive ? active : inactive)}
            >
              <Icon
                className={cn('mr-3 h-5 w-5 shrink-0', 'text-gray-500 group-hover:text-tract-gold')}
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="font-inter text-base">{label}</span>
            </NavLink>
          ) : href ? (
            <a
              key={label}
              href={href}
              className={cn(linkBase, inactive, 'w-full text-left')}
            >
              <Icon className="mr-3 h-5 w-5 shrink-0 text-gray-500" strokeWidth={1.75} aria-hidden />
              <span className="font-inter text-base">{label}</span>
            </a>
          ) : (
            <button
              key={label}
              type="button"
              className={cn(linkBase, inactive, 'w-full cursor-default text-left')}
            >
              <Icon className="mr-3 h-5 w-5 shrink-0 text-gray-500" strokeWidth={1.75} aria-hidden />
              <span className="font-inter text-base">{label}</span>
              <span className="ml-auto font-inter text-[10px] text-gray-600 uppercase">Soon</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-tract-graphite/30 p-6">
        <p className="mb-1 font-inter text-sm font-semibold text-tract-alabaster">{displayName}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex items-center gap-2 font-inter text-sm text-gray-500 transition-colors hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          Sign out
        </button>
      </div>
    </aside>
  )
}
