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
    <section
      className="group/hero relative isolate overflow-hidden rounded-[2rem]
        border border-app1-secondary/25 bg-gradient-to-br
        from-[#0B251A] via-[#123E2A] to-[#0A1F16]
        bg-[length:180%_180%] bg-[position:0%_0%]
        p-6 text-white shadow-2xl ring-1 ring-black/5
        transition-[background-position] duration-700 ease-out
        hover:bg-[position:100%_100%]
        motion-safe:animate-[hero-pan_16s_ease-in-out_infinite]
        motion-reduce:animate-none
        sm:p-8 lg:p-10
        dark:from-[#06150E] dark:via-[#0D281C] dark:to-[#08120C]"
    >
      {/* Grain/noise texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay
          [background-image:url('data:image/svg+xml;utf8,\
<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22>\
<filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/></filter>\
<rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]"
      />

      {/* Dot-grid texture, fading toward the left so it sits behind the text without fighting it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40
          [background-image:radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)]
          [background-size:22px_22px]
          [mask-image:linear-gradient(to_left,black,transparent_60%)]
          [-webkit-mask-image:linear-gradient(to_left,black,transparent_60%)]"
      />

      {/* Decorative blurred blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full
          bg-app1-secondary/20 blur-3xl transition-transform duration-700
          motion-safe:group-hover/hero:translate-x-2 motion-safe:group-hover/hero:-translate-y-2"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-12 size-72 rounded-full
          bg-emerald-500/15 blur-3xl transition-transform duration-700
          motion-safe:group-hover/hero:-translate-x-2 motion-safe:group-hover/hero:translate-y-2"
      />


      {/* Soft inner vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
      />

      <div className="relative max-w-5xl">
        {/* Eyebrow pill */}
        <div
          className="inline-flex items-center gap-2 rounded-full border border-app1-secondary/40
            bg-app1-secondary/15 px-4 py-2 shadow-sm ring-1 ring-inset ring-white/10
            backdrop-blur-md supports-[backdrop-filter]:bg-app1-secondary/10"
        >
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-app1-secondary opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-app1-secondary" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-app1-secondary">
            {eyebrow}
          </span>
        </div>

        {/* Title */}
        <h1 className="mt-5 text-balance font-cinzel text-3xl font-black leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mt-4 max-w-3xl text-pretty text-sm leading-7 text-white/80 sm:text-base">
          {description}
        </p>

        {/* Badge + actions */}
        <div className="mt-6 flex flex-wrap items-center gap-3 has-[>:nth-child(2)]:gap-4">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-white/15
              bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em]
              text-white/90 shadow-sm ring-1 ring-inset ring-white/10 backdrop-blur-md
              transition-all duration-200 hover:bg-white/15 hover:ring-white/20
              supports-[backdrop-filter]:bg-white/[0.08]"
          >
            <Sparkles className="size-4 text-app1-secondary" />
            {badgeText}
          </div>
          {actions}
        </div>
      </div>
    </section>
  )
}