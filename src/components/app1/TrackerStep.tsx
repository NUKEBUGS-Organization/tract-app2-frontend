import { CheckCircle2, Circle, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrackerStepProps {
  title: string
  description: string
  done?: boolean
  current?: boolean
}

export default function TrackerStep({ title, description, done, current }: TrackerStepProps) {
  return (
    <div className="relative flex gap-4 rounded-2xl border border-app1-border-light bg-app1-bg-card p-5 shadow-app1-card">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
          done
            ? 'border-app1-primary bg-app1-primary text-white'
            : current
              ? 'border-app1-secondary bg-app1-secondary/10 text-app1-secondary'
              : 'border-app1-border-light bg-app1-bg-soft text-app1-text-muted',
        )}
      >
        {done ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : current ? (
          <Clock3 className="h-5 w-5" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </div>

      <div>
        <h3 className="font-black text-app1-primary">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-app1-text-muted">{description}</p>
      </div>
    </div>
  )
}
