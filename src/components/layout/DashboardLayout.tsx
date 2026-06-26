import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { SidebarContext } from '@/contexts/SidebarContext'
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
        'flex min-h-screen bg-theme-bg font-inter text-theme-text transition-colors duration-200',
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
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-theme-border bg-theme-topbar px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-theme-border bg-theme-surface-2 text-theme-text transition-colors hover:bg-theme-card"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-playfair text-[20px] font-bold text-tract-gold">TRACT</span>
        </div>

        {children}
      </main>
    </div>
  )
}
