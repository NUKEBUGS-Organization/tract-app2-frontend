import { cn } from '@/lib/utils'
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react'
import { forwardRef, useCallback, useId, useRef, useState } from 'react'

export interface OtpSixInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  disabled?: boolean
  groupLabel: string
}

const LENGTH = 6

const OtpSixInput = forwardRef<HTMLDivElement, OtpSixInputProps>(function OtpSixInput(
  { value, onChange, onBlur, error, disabled, groupLabel },
  forwardedRef,
) {
  const baseId = useId()
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const setRefs = useCallback((el: HTMLInputElement | null, index: number) => {
    inputsRef.current[index] = el
  }, [])

  const commit = useCallback(
    (next: string) => {
      onChange(next.replace(/\D/g, '').slice(0, LENGTH))
    },
    [onChange],
  )

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const raw = e.target.value
    if (raw === '') {
      const next = `${value.slice(0, index)}${value.slice(index + 1)}`
      commit(next)
      if (index > 0) inputsRef.current[index - 1]?.focus()
      return
    }
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit) return
    const next = `${value.slice(0, index)}${digit}${value.slice(index + 1)}`.slice(0, LENGTH)
    commit(next)
    if (index < LENGTH - 1) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      e.preventDefault()
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    commit(text)
    const focusAt = Math.min(Math.max(text.length - 1, 0), LENGTH - 1)
    inputsRef.current[focusAt]?.focus()
  }

  return (
    <div
      ref={forwardedRef}
      role="group"
      aria-label={groupLabel}
      className="flex justify-between gap-1"
      onFocus={(e) => {
        if (e.target instanceof HTMLInputElement) {
          const idx = inputsRef.current.indexOf(e.target)
          if (idx >= 0) setFocusedIndex(idx)
        }
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocusedIndex(null)
          onBlur?.()
        }
      }}
    >
      {Array.from({ length: LENGTH }, (_, i) => {
        const digit = value[i] ?? ''
        const filled = digit !== ''
        const focused = focusedIndex === i
        return (
          <input
            key={`${baseId}-${i}`}
            id={`${baseId}-digit-${i}`}
            ref={(el) => setRefs(el, i)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`${groupLabel}, digit ${i + 1} of ${LENGTH}`}
            aria-invalid={error}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={cn(
              'h-[60px] w-[52px] rounded-lg bg-app1-bg-soft text-center font-cinzel text-[24px] font-bold text-app1-text-main outline-none transition-colors',
              error
                ? 'border border-app1-danger'
                : filled
                  ? 'border-2 border-app1-primary'
                  : focused
                    ? 'border-2 border-app1-secondary'
                    : 'border border-app1-border-light',
            )}
          />
        )
      })}
    </div>
  )
})

export default OtpSixInput
