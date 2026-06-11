import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  icon: ReactNode
  title: string
  description: string
  action?: { label: string; to: string }
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="text-gray-200">{icon}</div>
      <h3 className="font-playfair text-[24px] font-bold text-theme-text">{title}</h3>
      <p className="max-w-xs font-inter text-[14px] text-theme-muted">{description}</p>
      {action ? (
        <Link
          to={action.to}
          className="mt-2 bg-tract-gold px-8 py-3 font-inter text-[12px] font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-yellow-600"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}
