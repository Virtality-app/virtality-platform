import Image from 'next/image'
import { CREDIBILITY_LOGO_HOVER_CLASS } from '@/lib/partner-press'
import type { CredibilityLogoItem } from '@/lib/partner-press-content'
import { cn } from '@/lib/utils'

type CredibilityLogoProps = {
  item: CredibilityLogoItem
  size?: 'primary' | 'secondary'
  className?: string
}

function getCredibilityLogoDimensions(
  size: 'primary' | 'secondary',
  item: CredibilityLogoItem,
): string {
  if (size === 'primary') {
    return 'w-56 h-20'
  }

  if (item.wide) {
    return 'w-56 h-14'
  }

  if (item.compact) {
    return 'w-24 h-14'
  }

  return 'w-40 h-14'
}

const CredibilityLogo = ({
  item,
  size = 'primary',
  className,
}: CredibilityLogoProps) => {
  const dimensions = getCredibilityLogoDimensions(size, item)

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center gap-4',
        CREDIBILITY_LOGO_HOVER_CLASS,
        dimensions,
        className,
      )}
    >
      <div className={cn('relative h-full w-full', item.className)}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className={cn('absolute object-contain', item.className)}
        />
      </div>
      {size === 'primary' ? (
        <div className='w-2/3 h-[2px] rounded-full bg-linear-to-r from-transparent via-vital-blue-400 to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300' />
      ) : null}
    </div>
  )
}

export default CredibilityLogo
