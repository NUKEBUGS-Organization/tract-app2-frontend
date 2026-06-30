import { cn } from '@/lib/utils'

const TONE_MAP: Record<string, string> = {
  active: 'border-app1-primary/30 bg-app1-primary/10 text-app1-primary',
  pending: 'border-app1-warning/30 bg-app1-warning/10 text-app1-warning',
  signed: 'border-app1-primary/30 bg-app1-primary/10 text-app1-primary',
  cancelled: 'border-app1-danger/30 bg-app1-danger/10 text-app1-danger',
  default: 'border-app1-border-light bg-app1-bg-soft text-app1-text-muted',
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function StatusPill({ status }: { status: string }) {
  const key = status?.toLowerCase() ?? 'default'
  const toneClass = TONE_MAP[key] ?? TONE_MAP.default

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-4 py-2',
        'text-[10px] font-black uppercase tracking-[0.18em]',
        toneClass,
      )}
    >
      {formatStatus(status || 'unknown')}
    </span>
  )
}
