import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HelpCircle, MessageSquare, Plus } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminSidebar from '@/components/admin/AdminSidebar'
import Sidebar from '@/components/layout/Sidebar'
import TitleRepSidebar from '@/components/title/TitleRepSidebar'
import WholesalerSidebar from '@/components/wholesaler/WholesalerSidebar'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    to: '/support',
    exact: true,
    icon: MessageSquare,
    label: 'My Tickets',
  },
  {
    to: '/support/faq',
    exact: false,
    icon: HelpCircle,
    label: 'FAQ',
  },
]

export default function SupportLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const role = useAuthStore((s) => s.user?.role)

  const sidebar =
    role === 'admin' ? (
      <AdminSidebar />
    ) : role === 'title_rep' ? (
      <TitleRepSidebar />
    ) : role === 'buyer' ? (
      <Sidebar />
    ) : (
      <WholesalerSidebar />
    )

  return (
    <DashboardLayout sidebar={sidebar}>
      <div className="min-h-screen bg-app1-bg-main">
        <div className="mx-auto max-w-[1200px] p-6 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
            <aside className="w-full shrink-0 lg:w-[220px]">
              <div className="rounded-app1-card border border-app1-border-light bg-app1-bg-card p-4 shadow-app1-card">
                <p className="mb-3 px-2 font-poppins text-[10px] font-black uppercase tracking-[0.2em] text-app1-text-muted">
                  Support
                </p>
                <nav className="space-y-1">
                  {NAV_ITEMS.map(({ to, exact, icon: Icon, label }) => {
                    const active = exact ? pathname === to : pathname.startsWith(to)
                    return (
                      <Link
                        key={to}
                        to={to}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-bold transition-colors',
                          active
                            ? 'bg-app1-secondary/10 text-app1-secondary'
                            : 'text-app1-text-muted hover:bg-app1-bg-soft hover:text-app1-text-main',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0',
                            active ? 'text-app1-secondary' : 'text-app1-text-muted',
                          )}
                          strokeWidth={1.75}
                        />
                        {label}
                      </Link>
                    )
                  })}
                </nav>

                <div className="mt-4 border-t border-app1-border-light pt-4">
                  <Link
                    to="/support/new"
                    className="flex w-full items-center justify-center gap-2 bg-app1-secondary px-4 py-2.5 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-primary-dark transition-all hover:scale-[1.02]"
                  >
                    <Plus className="h-4 w-4" />
                    New Ticket
                  </Link>
                </div>
              </div>
            </aside>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
