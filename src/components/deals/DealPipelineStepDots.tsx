import { DEAL_STEP_ORDER, type DealStep } from '@/types'
import { cn } from '@/lib/utils'

const STEP_LABELS: Record<DealStep, string> = {
  contract_signed: 'Contract signed',
  emd_deposited: 'EMD deposited',
  inspection_period: 'Inspection',
  appraisal_ordered: 'Appraisal',
  financing_approved: 'Financing',
  title_search_complete: 'Title search',
  clear_to_close: 'Clear to close',
  funded_closed: 'Closed',
}

type DealPipelineStepDotsProps = {
  currentStep: string
  className?: string
}

/** Compact 8-dot progress for STEP_ORDER — filled through currentStep. */
export default function DealPipelineStepDots({ currentStep, className }: DealPipelineStepDotsProps) {
  const idx = DEAL_STEP_ORDER.indexOf(currentStep as DealStep)
  const safeIdx = idx < 0 ? 0 : idx
  const label = STEP_LABELS[currentStep as DealStep] ?? currentStep

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={`Step ${safeIdx + 1} of ${DEAL_STEP_ORDER.length}: ${label}`}
      >
        {DEAL_STEP_ORDER.map((step, i) => (
          <span
            key={step}
            title={STEP_LABELS[step]}
            className={cn(
              'h-2 w-2 shrink-0 rounded-full transition-colors',
              i < safeIdx && 'bg-app1-primary',
              i === safeIdx && 'bg-app1-secondary ring-2 ring-app1-secondary/35 ring-offset-1 ring-offset-app1-bg-card',
              i > safeIdx && 'bg-app1-border-light',
            )}
          />
        ))}
      </div>
      <p className="truncate font-poppins text-xs font-bold text-app1-text-muted">
        {safeIdx + 1}/{DEAL_STEP_ORDER.length} · {label}
      </p>
    </div>
  )
}
