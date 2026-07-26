import type { DealStep } from '@/types'

/** Maps each DealStep to the schema field stamped when that step is entered. */
export const STEP_ENTERED_AT_FIELD: Record<
  DealStep,
  | 'contractSignedAt'
  | 'emdDepositedAt'
  | 'inspectionCompletedAt'
  | 'appraisalOrderedAt'
  | 'financingApprovedAt'
  | 'titleSearchCompleteAt'
  | 'clearToCloseAt'
  | 'closedAt'
> = {
  contract_signed: 'contractSignedAt',
  emd_deposited: 'emdDepositedAt',
  inspection_period: 'inspectionCompletedAt',
  appraisal_ordered: 'appraisalOrderedAt',
  financing_approved: 'financingApprovedAt',
  title_search_complete: 'titleSearchCompleteAt',
  clear_to_close: 'clearToCloseAt',
  funded_closed: 'closedAt',
}

export type DealStepTimestamps = Partial<
  Record<(typeof STEP_ENTERED_AT_FIELD)[DealStep], string | null | undefined>
>

/** ISO timestamp when `currentStep` was entered, or null if unknown. */
export function getCurrentStepEnteredAt(
  currentStep: DealStep,
  timestamps: DealStepTimestamps,
  fallbackCreatedAt?: string | null,
): string | null {
  const field = STEP_ENTERED_AT_FIELD[currentStep]
  const raw = timestamps[field]
  if (raw) return raw
  // Step 1 is set at create; fall back to createdAt if contractSignedAt missing
  if (currentStep === 'contract_signed' && fallbackCreatedAt) return fallbackCreatedAt
  return null
}

/** Human duration from enteredAt → now (e.g. "2d 5h", "3h 12m", "45m"). */
export function formatTimeInStep(enteredAtIso: string, nowMs: number = Date.now()): string {
  const start = new Date(enteredAtIso).getTime()
  if (Number.isNaN(start)) return '—'
  const ms = Math.max(0, nowMs - start)
  const totalMin = Math.floor(ms / 60_000)
  const days = Math.floor(totalMin / (60 * 24))
  const hours = Math.floor((totalMin % (60 * 24)) / 60)
  const mins = totalMin % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}
