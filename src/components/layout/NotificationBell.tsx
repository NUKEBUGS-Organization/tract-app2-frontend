import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useMarkRead, useNotifications, useUnreadCount } from '@/hooks/useNotifications'

const TYPE_CONFIG: Record<
  string,
  {
    icon: string
    label: string
    color: string
  }
> = {
  ticket_created: {
    icon: '🎫',
    label: 'New ticket',
    color: 'text-app1-secondary',
  },
  ticket_reply: {
    icon: '💬',
    label: 'Ticket reply',
    color: 'text-app1-primary',
  },
  ticket_resolved: {
    icon: '✅',
    label: 'Ticket resolved',
    color: 'text-app1-primary',
  },
  deal_advanced: {
    icon: '📋',
    label: 'Deal update',
    color: 'text-app1-primary',
  },
  bid_selected: {
    icon: '🏆',
    label: 'Bid selected',
    color: 'text-app1-secondary',
  },
  default: {
    icon: '🔔',
    label: 'Notification',
    color: 'text-app1-text-muted',
  },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { data: notifications = [], isLoading } = useNotifications()
  const unreadCount = useUnreadCount()
  const markRead = useMarkRead()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative rounded-lg p-2 text-app1-text-muted transition-colors hover:bg-app1-bg-soft hover:text-app1-text-main"
      >
        <Bell className="h-5 w-5" strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-app1-danger font-poppins text-[10px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,360px)] overflow-hidden rounded-app1-card border border-app1-border-light bg-app1-bg-card shadow-app1-card">
          <div className="border-b border-app1-border-light px-4 py-3">
            <p className="font-poppins text-[11px] font-black uppercase tracking-[0.16em] text-app1-text-muted">
              Notifications
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 font-poppins text-sm text-app1-text-muted">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 font-poppins text-sm text-app1-text-muted">No notifications yet.</p>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!n.isRead) markRead.mutate(n.id)
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-app1-bg-soft',
                      !n.isRead && 'bg-app1-secondary/5',
                    )}
                  >
                    <span className="mt-0.5 shrink-0 text-lg">{cfg.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cn('font-poppins text-[13px] font-bold', cfg.color)}>{cfg.label}</p>
                      <p className="truncate font-poppins text-[12px] text-app1-text-muted">{n.body}</p>
                      <p className="mt-0.5 font-poppins text-[10px] text-app1-text-muted">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!n.isRead ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-app1-secondary" />
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
          <div className="border-t border-app1-border-light px-4 py-2">
            <Link
              to="/support"
              onClick={() => setOpen(false)}
              className="font-poppins text-[11px] font-black uppercase tracking-[0.14em] text-app1-secondary hover:underline"
            >
              Open support →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
