import { ChevronDown } from 'lucide-react'
import { Controller, type Control, type FieldError, type FieldValues, type Path } from 'react-hook-form'
import { APP2_STATES } from '@/lib/constants/states'
import { cn } from '@/lib/utils'

interface HomeStateSelectProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  error?: FieldError
  inputNormal: string
  inputInvalid: string
  id?: string
}

export default function HomeStateSelect<T extends FieldValues>({
  control,
  name,
  error,
  inputNormal,
  inputInvalid,
  id = 'home-state',
}: HomeStateSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          <div className="space-y-2 md:hidden" role="listbox" aria-label="Home state">
            {APP2_STATES.map((s) => {
              const selected = field.value === s.code
              return (
                <button
                  key={s.code}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    field.onChange(s.code)
                    field.onBlur()
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left font-poppins text-base transition-colors',
                    selected
                      ? 'border-app1-secondary bg-app1-secondary/5 text-app1-primary'
                      : 'border-app1-border-light bg-app1-bg-soft text-app1-text-main active:border-app1-secondary/50',
                  )}
                >
                  <span>{s.name}</span>
                  {selected ? (
                    <span className="font-poppins text-sm font-bold text-app1-secondary">{s.code}</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          <div className="relative hidden md:block">
            <select
              id={id}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
              aria-invalid={!!error}
              className={cn(
                'h-12 w-full cursor-pointer rounded-lg border px-4 pr-10 font-poppins text-base',
                error ? inputInvalid : inputNormal,
              )}
            >
              <option value="">Select a state</option>
              {APP2_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-app1-text-muted"
              aria-hidden
            />
          </div>
        </>
      )}
    />
  )
}
