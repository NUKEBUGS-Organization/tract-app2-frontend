import { cn } from '@/lib/utils'

export const BUY_TRACT_LOGO_SRC = '/brand/buy-tract-logo.png'
export const BUY_TRACT_SLOGAN = 'Buy the Best. Skip the Rest.'

const SIZE_CLASS = {
  sm: 'h-11 w-auto max-w-[148px]',
  md: 'h-16 w-auto max-w-[200px]',
  lg: 'h-28 w-auto max-w-[280px] md:h-36 md:max-w-[340px]',
} as const

type BrandMarkSize = keyof typeof SIZE_CLASS

interface BrandMarkProps {
  size?: BrandMarkSize
  showSlogan?: boolean
  className?: string
  sloganClassName?: string
}

export default function BrandMark({
  size = 'md',
  showSlogan = true,
  className,
  sloganClassName,
}: BrandMarkProps) {
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
