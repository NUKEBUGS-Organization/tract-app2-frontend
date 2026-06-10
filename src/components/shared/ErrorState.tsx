import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <AlertTriangle className="h-10 w-10 text-tract-red" strokeWidth={1.5} />
      <p className="max-w-xs font-inter text-[14px] text-gray-500">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 font-inter text-[12px] font-bold uppercase tracking-wider text-tract-gold hover:underline"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      ) : null}
    </div>
  )
}
