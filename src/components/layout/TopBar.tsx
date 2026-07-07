import type { ReactNode } from 'react'
import NotificationBell from '@/components/layout/NotificationBell'
import { DEFAULT_AVATAR_IMAGE } from '@/lib/placeholders'

interface TopBarProps {
  title: string
  actions?: ReactNode
}

export default function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 hidden h-16 items-center justify-between border-b border-theme-border bg-theme-topbar px-6 transition-colors duration-200 md:px-12 lg:flex">
      <h2 className="font-playfair text-[22px] font-bold text-theme-text">{title}</h2>
      <div className="flex items-center gap-4 md:gap-6">
        {actions}
        <NotificationBell />
        <img
          src={DEFAULT_AVATAR_IMAGE}
          alt=""
          className="h-9 w-9 rounded-full border border-theme-border object-cover"
        />
      </div>
    </header>
  )
}
