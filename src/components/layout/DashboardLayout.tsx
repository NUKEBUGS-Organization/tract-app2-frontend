import { useState, type ReactNode } from 'react'
import { HelpCircle, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SidebarContext } from '@/contexts/SidebarContext'
import DashboardToolbar from '@/components/layout/DashboardToolbar'
import NotificationBell from '@/components/layout/NotificationBell'
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
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-app1-border-light bg-app1-bg-card px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-app1-border-light bg-app1-bg-soft text-app1-text-main transition-colors hover:bg-app1-bg-card"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-cinzel text-[20px] font-black text-app1-secondary">TRACT</span>
          <div className="flex items-center gap-1">
            <Link
              to="/support"
              className="rounded-lg p-2 text-app1-text-muted hover:bg-app1-bg-soft hover:text-app1-secondary"
              aria-label="Support"
            >
              <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
            </Link>
            <NotificationBell />
          </div>
        </div>

        <DashboardToolbar />

        {children}
      </main>
    </div>
  )
}
