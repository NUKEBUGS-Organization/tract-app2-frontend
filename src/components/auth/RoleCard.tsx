import type { LucideIcon } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface RoleCardProps {
  icon: LucideIcon
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

export default function RoleCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: RoleCardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={title}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex cursor-pointer items-center rounded-xl p-6 transition-all duration-200',
        selected
          ? 'border-2 border-app1-secondary bg-app1-secondary/5'
          : 'border border-app1-border-light bg-app1-bg-card hover:border-app1-secondary/50',
      )}
    >
      <div
        className={cn(
          'mr-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded',
          selected ? 'bg-app1-secondary/10 text-app1-secondary' : 'bg-app1-bg-soft text-app1-text-muted',
        )}
      >
        <Icon size={24} />
      </div>
      <div className="min-w-0 flex-grow">
        <h3 className="mb-1 font-cinzel text-[20px] font-black text-app1-primary">{title}</h3>
        <p className="font-poppins text-[14px] text-app1-text-muted">{description}</p>
      </div>
      <div
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-app1-secondary' : 'border-app1-border-light',
        )}
      >
        {selected ? <div className="h-3 w-3 rounded-full bg-app1-secondary" /> : null}
      </div>
    </div>
  )
}
