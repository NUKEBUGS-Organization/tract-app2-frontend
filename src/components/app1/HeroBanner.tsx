import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface HeroBannerProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  badgeText?: string
}

export default function HeroBanner({
  eyebrow,
  title,
  description,
  actions,
  badgeText = 'Live metrics',
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-app1-primary/15 bg-app1-primary p-6 text-white shadow-app1-card sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-app1-secondary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-12 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-10 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />

      <div className="relative max-w-5xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-app1-secondary/40 bg-app1-secondary/10 px-4 py-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-app1-secondary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-app1-secondary" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-app1-secondary">{eyebrow}</span>
        </div>

        <h1 className="mt-5 font-cinzel text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{title}</h1>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">{description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/80">
            <Sparkles className="h-4 w-4 text-app1-secondary" />
            {badgeText}
          </div>
          {actions}
        </div>
      </div>
    </section>
  )
}
