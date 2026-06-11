import type { ReactNode } from 'react'
import { Bell } from 'lucide-react'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'

interface TopBarProps {
  title: string
  actions?: ReactNode
}

export default function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-theme-border bg-theme-topbar px-6 md:px-12 transition-colors duration-200">
      <h2 className="font-playfair text-[22px] font-bold text-theme-text">{title}</h2>
      <div className="flex items-center gap-4 md:gap-6">
        {actions}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded p-1 text-theme-muted transition-colors hover:text-tract-gold"
        >
          <Bell className="h-6 w-6" strokeWidth={1.75} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-tract-red" aria-hidden />
        </button>
        <img
          src={DEFAULT_AVATAR_IMAGE}
          alt=""
          className="h-9 w-9 rounded-full border border-theme-border object-cover"
        />
      </div>
    </header>
  )
}
