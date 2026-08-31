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
  /** Render `note` as a solid status pill (high-contrast) instead of muted text. */
  noteAsPill?: boolean
  tone?: 'primary' | 'danger' | 'warning' | 'neutral'
}

function getToneClasses(tone: StatCardProps['tone'] = 'primary') {
  if (tone === 'danger') {
    return {
      soft: 'bg-app1-danger/10 dark:bg-app1-danger/15 text-app1-danger shadow-md shadow-app1-danger/10 border border-app1-danger/25 dark:border-app1-danger/20',
      border: 'hover:border-app1-danger/30',
      glow: 'bg-app1-danger/10 dark:bg-app1-danger/15',
      accent: 'border-l-app1-danger',
      pillBg: 'bg-app1-danger text-white dark:bg-app1-danger/90',
    }
  }
  if (tone === 'warning') {
    return {
      soft: 'bg-app1-warning/10 dark:bg-app1-warning/15 text-app1-warning shadow-md shadow-app1-warning/10 border border-app1-warning/25 dark:border-app1-warning/20',
      border: 'hover:border-app1-warning/30',
      glow: 'bg-app1-warning/10 dark:bg-app1-warning/15',
      accent: 'border-l-app1-warning',
      pillBg: 'bg-app1-warning text-app1-primary-dark dark:bg-app1-warning/90',
    }
  }
  if (tone === 'neutral') {
    return {
      soft: 'bg-app1-bg-soft/80 dark:bg-white/5 text-app1-primary shadow-md shadow-black/5 border border-app1-border-light/80 dark:border-white/10',
      border: 'hover:border-app1-secondary/40',
      glow: 'bg-app1-secondary/10 dark:bg-app1-secondary/15',
      accent: 'border-l-app1-secondary',
      pillBg: 'bg-app1-primary text-white dark:bg-white/90 dark:text-app1-primary',
    }
  }
  // Primary (default)
  return {
    soft: 'bg-app1-primary/10 dark:bg-app1-primary/15 text-app1-primary shadow-md shadow-black/5 border border-app1-border-light/80 dark:border-white/10',
    border: 'hover:border-app1-primary/25',
    glow: 'bg-app1-primary/10 dark:bg-app1-primary/15',
    accent: 'border-l-app1-primary',
    pillBg: 'bg-app1-primary text-white dark:bg-app1-primary/90',
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
  noteAsPill = false,
  tone = 'primary',
}: StatCardProps) {
  const toneClasses = getToneClasses(tone)

  const content = (
    <div
      className={cn(
        // Fixed height so every card in the grid is identical
        'group relative flex h-[168px] min-w-0 flex-col overflow-hidden',
        'rounded-app1-card border p-5',
        'shadow-app1-card transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl',
        'focus:outline-none focus:ring-2 focus:ring-app1-secondary/40 focus:ring-offset-2 focus:ring-offset-app1-bg-main',
        featured
          ? 'border-app1-primary/20 bg-app1-primary text-white dark:border-app1-primary/40'
          : cn(
            'border-app1-border-light/70 dark:border-white/[0.08]',
            'bg-white dark:bg-white/[0.04]',
            'backdrop-blur-sm',
            // left accent always present; transparent when no pill so layout is stable
            'border-l-[3px]',
            noteAsPill ? toneClasses.accent : 'border-l-transparent',
            toneClasses.border,
            'hover:bg-app1-bg-soft/50 dark:hover:bg-white/[0.06]',
          ),
      )}
    >
      {/* Ambient glow blob */}
      <div
        className={cn(
          'pointer-events-none absolute -right-10 -top-12',
          'h-32 w-32 rounded-full blur-2xl',
          'transition-all duration-500 group-hover:scale-150',
          featured
            ? 'bg-app1-secondary/20 dark:bg-app1-secondary/30'
            : cn(toneClasses.glow, 'dark:opacity-40'),
        )}
      />

      {/* Bottom hover accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-app1-secondary transition-transform duration-300 group-hover:scale-x-100 dark:opacity-60" />

      {/* ── Top row: label left, icon right ── */}
      <div className="relative flex items-start justify-between gap-3">
        <p
          className={cn(
            'text-[10px] font-black uppercase tracking-[0.2em] leading-tight',
            featured ? 'text-white/65' : 'text-app1-text-muted dark:text-white/40',
          )}
        >
          {label}
        </p>

        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            'transition-all duration-300',
            'group-hover:rotate-6 group-hover:scale-110',
            featured
              ? 'bg-white/20 text-white shadow-md shadow-black/20 border border-white/20'
              : cn(
                toneClasses.soft,
                'dark:bg-white/5 dark:border dark:border-white/10',
              ),
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5 stroke-[2]',
              featured ? 'text-white' : 'text-current',
            )}
            aria-hidden
          />
        </div>
      </div>

      {/* ── Value ── */}
      <div
        className={cn(
          'relative mt-2 font-cinzel text-[2.35rem] font-black leading-none transition-transform duration-300 group-hover:scale-[1.03]',
          featured ? 'text-white' : 'text-app1-primary dark:text-white',
        )}
      >
        {formatNumber(value)}
      </div>

      {/* ── Note + Open link — pushed to bottom ── */}
      <div className="relative mt-auto flex items-center justify-between gap-2 pt-1">
        {noteAsPill && !featured ? (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5',
              'font-poppins text-[9px] font-black uppercase tracking-[0.14em]',
              toneClasses.pillBg,
            )}
          >
            {note}
          </span>
        ) : (
          <p
            className={cn(
              'text-[11px] font-semibold leading-tight',
              featured ? 'text-white/70' : 'text-app1-text-muted dark:text-white/40',
            )}
          >
            {note}
          </p>
        )}

        {path && (
          <div
            className={cn(
              'flex shrink-0 items-center gap-0.5',
              'text-[9px] font-black uppercase tracking-[0.16em]',
              'transition-all duration-200 group-hover:gap-1',
              featured ? 'text-white/70' : 'text-app1-secondary dark:text-app1-secondary/80',
            )}
          >
            Open
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        )}
      </div>
    </div>
  )

  if (path) {
    return <Link to={path}>{content}</Link>
  }
  return content
}
