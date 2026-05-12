import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  sidebar: ReactNode
  children: ReactNode
  className?: string
}

export default function DashboardLayout({ sidebar, children, className }: DashboardLayoutProps) {
  return (
    <div className={cn('flex min-h-screen bg-tract-alabaster font-inter text-tract-obsidian', className)}>
      {sidebar}
      <main className="ml-64 flex min-h-screen min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
