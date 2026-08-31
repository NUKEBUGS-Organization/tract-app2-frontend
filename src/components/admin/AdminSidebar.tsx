import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  HelpCircle,
  LogOut,
  List,
  Users,
  Gavel,
  Globe,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSidebarClose } from '@/contexts/SidebarContext'
import BrandMark from '@/components/brand/BrandMark'

const NAV_ITEMS = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    to: '/admin/dashboard',
  },
  {
    label: 'Verification Queue',
    icon: ShieldCheck,
    to: '/admin/verification-queue',
  },
  {
    label: 'Penalty Log',
    icon: AlertTriangle,
    to: '/admin/penalties',
  },
  {
    label: 'Chat Surveillance',
    icon: MessageSquare,
    to: '/admin/chat',
  },
  {
    label: 'Financial Ledger',
    icon: BarChart3,
    to: '/admin/ledger',
  },
  {
    label: 'All Deals',
    icon: Gavel,
    to: '/admin/deals',
  },
  {
    label: 'Pending Listings',
    icon: List,
    to: '/admin/listings',
  },
  {
    label: 'State Firewall',
    icon: Globe,
    to: '/admin/state-firewall',
  },
  {
    label: 'User Management',
    icon: Users,
    to: '/admin/users',
  },
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const closeSidebar = useSidebarClose()

  const linkBase = cn(
    'flex items-center gap-3 rounded-r-lg',
    'px-3 py-2.5 font-inter text-[13px]',
    'transition-all duration-150',
    'border-l-4',
  )

  const active = cn(
    'border-tract-gold',
    'bg-white/10',
    'text-tract-gold font-bold',
  )

  const inactive = cn(
    'border-transparent',
    'text-white/60',
    'hover:bg-white/10',
    'hover:text-white font-medium',
  )

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col',
        'border-r border-theme-border bg-theme-sidebar text-[color:var(--color-sidebar-text)]',
        'transition-colors duration-200',
      )}
    >
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <BrandMark
              variant="sidebar"
              titleClassName="text-white"
              sloganClassName="text-tract-gold"
            />
            <p className="mt-2 font-inter text-[10px] font-bold uppercase tracking-widest text-white/50">
              Admin · Control Center
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 no-scrollbar">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
          const isActive =
            location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                closeSidebar()
                navigate(to)
              }}
              className={cn(linkBase, 'w-full text-left', isActive ? active : inactive)}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-tract-gold' : 'text-white/60',
                )}
                strokeWidth={1.75}
              />
              <span>{label}</span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => {
            closeSidebar()
            navigate('/support')
          }}
          className={cn(linkBase, 'w-full text-left', location.pathname.startsWith('/support') ? active : inactive)}
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-white/60" strokeWidth={1.75} />
          <span>Support</span>
        </button>
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 font-inter text-[13px] font-bold text-white">
            {user?.fullName?.slice(0, 1).toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-inter text-[13px] font-semibold text-white/90">
              {user?.fullName ?? 'Admin'}
            </p>
            <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-white/50">
              Administrator
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className={cn(
            'flex items-center gap-2 font-inter text-sm text-white/70 transition-colors hover:text-tract-red',
            'w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/5',
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
