import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import NotificationBell from '@/components/layout/NotificationBell'

export default function DashboardToolbar() {
  return (
    <div className="sticky top-0 z-20 hidden items-center justify-end gap-2 border-b border-app1-border-light bg-app1-bg-card px-6 py-3 lg:flex">
      <Link
        to="/support"
        className="inline-flex items-center gap-2 rounded-lg border border-app1-border-light bg-app1-bg-soft px-4 py-2 font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-text-main transition-colors hover:border-app1-secondary/40 hover:text-app1-secondary"
      >
        <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        Support
      </Link>
      <NotificationBell />
    </div>
  )
}
