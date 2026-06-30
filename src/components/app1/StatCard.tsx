import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string | number
  note: string
  icon: LucideIcon
  path?: string
  featured?: boolean
  tone?: 'primary' | 'danger' | 'warning' | 'neutral'
}

function getToneClasses(tone: StatCardProps['tone'] = 'primary') {
  if (tone === 'danger') {
    return {
      soft: 'bg-app1-danger/10 text-app1-danger',
      border: 'hover:border-app1-danger/30',
      glow: 'bg-app1-danger/10',
    }
  }
  if (tone === 'warning') {
    return {
      soft: 'bg-app1-warning/10 text-app1-warning',
      border: 'hover:border-app1-warning/30',
      glow: 'bg-app1-warning/10',
    }
  }
  if (tone === 'neutral') {
    return {
      soft: 'bg-app1-bg-soft text-app1-primary',
      border: 'hover:border-app1-secondary/40',
      glow: 'bg-app1-secondary/10',
    }
  }
  return {
    soft: 'bg-app1-primary/8 text-app1-primary',
    border: 'hover:border-app1-primary/25',
    glow: 'bg-app1-primary/10',
  }
}

function formatNumber(value: string | number) {
  if (typeof value === 'string') return value
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString()
}

export default function StatCard({
  label,
  value,
  note,
  icon: Icon,
  path,
  featured = false,
  tone = 'primary',
}: StatCardProps) {
  const toneClasses = getToneClasses(tone)

  const content = (
    <div
      className={cn(
        'group relative min-w-0 overflow-hidden',
        'rounded-app1-card border p-5',
        'shadow-app1-card transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl',
        'focus:outline-none focus:ring-2',
        'focus:ring-app1-secondary/40',
        featured
          ? 'border-app1-primary/20 bg-app1-primary text-white'
          : cn(
              'border-app1-border-light bg-app1-bg-card',
              toneClasses.border,
              'hover:bg-app1-bg-soft/70',
            ),
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-12 -top-14',
          'h-36 w-36 rounded-full blur-2xl',
          'transition-all duration-500',
          'group-hover:scale-150',
          featured ? 'bg-app1-secondary/20' : toneClasses.glow,
        )}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-app1-secondary transition-transform duration-300 group-hover:scale-x-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              'max-w-[180px] text-[10px] font-black uppercase tracking-[0.22em]',
              featured ? 'text-white/65' : 'text-app1-text-muted',
            )}
          >
            {label}
          </p>

          <div
            className={cn(
              'mt-4 font-cinzel text-4xl font-black leading-none transition-transform duration-300 group-hover:scale-[1.03]',
              featured ? 'text-white' : 'text-app1-primary',
            )}
          >
            {formatNumber(value)}
          </div>

          <p className={cn('mt-2 text-xs font-semibold', featured ? 'text-white/70' : 'text-app1-text-muted')}>
            {note}
          </p>
        </div>

        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            'transition-all duration-300',
            'group-hover:rotate-3 group-hover:scale-110',
            featured ? 'bg-white/10 text-white' : toneClasses.soft,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>

      {path && (
        <div
          className={cn(
            'relative mt-5 flex items-center gap-1',
            'text-[10px] font-black uppercase tracking-[0.16em] transition',
            featured ? 'text-white/80' : 'text-app1-secondary',
          )}
        >
          Open
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      )}
    </div>
  )

  if (path) {
    return <Link to={path}>{content}</Link>
  }
  return content
}
