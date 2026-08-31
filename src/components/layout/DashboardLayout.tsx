import { useState, type ReactNode } from 'react'
import { HelpCircle, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SidebarContext } from '@/contexts/SidebarContext'
import DashboardToolbar from '@/components/layout/DashboardToolbar'
import DashboardFooter from '@/components/layout/DashboardFooter'
import NotificationBell from '@/components/layout/NotificationBell'
import BrandMark from '@/components/brand/BrandMark'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  className?: string
}

export default function DashboardLayout({ sidebar, children, className }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div
      className={cn(
        'flex min-h-screen bg-app1-bg-main font-poppins text-app1-text-main transition-colors duration-200',
        className,
      )}
    >
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeSidebar} aria-hidden />
      ) : null}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <SidebarContext.Provider value={{ close: closeSidebar }}>{sidebar}</SidebarContext.Provider>
      </div>

      <main className={cn('flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64')}>
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-app1-border-light bg-app1-bg-card/90 px-4 backdrop-blur-md transition-colors duration-300 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-app1-border-light bg-app1-bg-soft/90 text-app1-text-main shadow-sm transition-all duration-200 hover:bg-app1-bg-card hover:border-app1-secondary/40 active:scale-95"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <BrandMark
            variant="sidebar"
            showSlogan={false}
            className="scale-90"
            titleClassName="text-app1-primary"
          />
          <div className="flex items-center gap-1.5">
            <Link
              to="/support"
              className="rounded-xl p-2 text-app1-text-muted transition-colors hover:bg-app1-bg-soft hover:text-app1-secondary"
              aria-label="Support"
            >
              <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <NotificationBell />
          </div>
        </div>

        <DashboardToolbar />

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>

        <DashboardFooter />
      </main>
    </div>
  )
}
