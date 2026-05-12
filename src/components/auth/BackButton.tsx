import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  to: string
  label?: string
  className?: string
}

export default function BackButton({ to, label = 'Back', className }: BackButtonProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className={cn(
        'mb-6 inline-flex items-center gap-2 font-inter text-[13px] text-gray-400 transition-colors hover:text-tract-obsidian',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
      {label}
    </button>
  )
}
