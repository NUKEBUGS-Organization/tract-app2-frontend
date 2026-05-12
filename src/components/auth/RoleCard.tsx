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
          ? 'border-2 border-tract-gold bg-tract-gold/5'
          : 'border border-tract-graphite bg-white hover:border-tract-gold',
      )}
    >
      <div
        className={cn(
          'mr-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded',
          selected ? 'bg-tract-gold/10 text-tract-gold' : 'bg-gray-100 text-gray-500',
        )}
      >
        <Icon size={24} />
      </div>
      <div className="min-w-0 flex-grow">
        <h3 className="mb-1 font-playfair text-[20px] font-bold text-tract-obsidian">{title}</h3>
        <p className="font-inter text-[14px] text-gray-500">{description}</p>
      </div>
      <div
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
          selected ? 'border-tract-gold' : 'border-gray-200',
        )}
      >
        {selected ? <div className="h-3 w-3 rounded-full bg-tract-gold" /> : null}
      </div>
    </div>
  )
}
