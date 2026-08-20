import { cn } from '@/lib/utils'

export const BUY_TRACT_LOGO_SRC = '/brand/buy-tract-logo.png'
export const BUY_TRACT_SLOGAN = 'Buy the Best. Skip the Rest.'

const SIZE_CLASS = {
  sm: 'h-11 w-auto max-w-[148px]',
  md: 'h-16 w-auto max-w-[200px]',
  lg: 'h-28 w-auto max-w-[280px] md:h-36 md:max-w-[340px]',
} as const

type BrandMarkSize = keyof typeof SIZE_CLASS
type BrandMarkVariant = 'mark' | 'sidebar'

interface BrandMarkProps {
  /** `sidebar` = App 2 logo + title/slogan side-by-side. `mark` = logo stacked (login). */
  variant?: BrandMarkVariant
  size?: BrandMarkSize
  showSlogan?: boolean
  className?: string
  sloganClassName?: string
  titleClassName?: string
}

export default function BrandMark({
  variant = 'mark',
  size = 'md',
  showSlogan = true,
  className,
  sloganClassName,
  titleClassName,
}: BrandMarkProps) {
  if (variant === 'sidebar') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <img
          src={BUY_TRACT_LOGO_SRC}
          alt="Buy TRACT"
          className="h-12 w-auto shrink-0 object-contain"
        />
        <div className="min-w-0">
          <div
            className={cn(
              'font-cinzel text-2xl font-normal leading-none tracking-tight text-white',
              titleClassName,
            )}
          >
            BUY TRACT
          </div>
          {showSlogan ? (
            <p
              className={cn(
                'mt-0.5 text-[9px] font-semibold uppercase leading-snug tracking-[0.3em] text-tract-gold',
                sloganClassName,
              )}
            >
              Buy the best
              <br />
              skip the Rest
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-start', className)}>
      <img
        src={BUY_TRACT_LOGO_SRC}
        alt="Buy TRACT"
        className={cn(SIZE_CLASS[size], 'object-contain')}
      />
      {showSlogan ? (
        <p
          className={cn(
            'mt-1.5 font-poppins text-[10px] font-medium leading-snug tracking-wide text-white/55',
            sloganClassName,
          )}
        >
          {BUY_TRACT_SLOGAN}
        </p>
      ) : null}
    </div>
  )
}
