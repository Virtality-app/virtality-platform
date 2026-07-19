import CredibilityLogo from '@/components/home/credibility-logo'
import CredibilitySectionHeader from '@/components/home/credibility-section-header'
import {
  PRESS_LOGO_ITEMS,
  PRESS_SECTION_CONTENT,
  type PressLogoItem,
} from '@/lib/partner-press-content'
import { filterValidLogoItems, getPressLinkProps } from '@/lib/partner-press'
import { cn } from '@/lib/utils'

const PRESS_MARQUEE_GAP_CLASS = 'gap-8 pe-8 md:gap-10 md:pe-10'

function getPressLogoClassName(item: PressLogoItem): string {
  if (item.wide) {
    // Compact wordmarks (short aspect) share wide height but a tighter width.
    if (item.compact) {
      return 'h-8 w-16 md:h-10 md:w-24'
    }

    return 'h-8 w-36 md:h-10 md:w-44'
  }

  return 'size-14 md:size-16'
}

function PressLogo({ item }: { item: PressLogoItem }) {
  const logo = (
    <CredibilityLogo
      item={item}
      size='secondary'
      className={getPressLogoClassName(item)}
    />
  )
  const href = item.href?.trim()

  if (!href) {
    return <div className='inline-flex shrink-0'>{logo}</div>
  }

  return (
    <a
      href={href}
      {...getPressLinkProps(href)}
      className='inline-flex shrink-0'
    >
      {logo}
    </a>
  )
}

type PressLogosProps = {
  className?: string
}

const PressLogos = ({ className }: PressLogosProps) => {
  const pressItems = filterValidLogoItems(PRESS_LOGO_ITEMS)

  if (pressItems.length === 0) {
    return null
  }

  return (
    <div className={cn(className)}>
      <CredibilitySectionHeader content={PRESS_SECTION_CONTENT} />

      <div className='group/marquee relative mt-2 w-full overflow-hidden'>
        <div
          className='pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent sm:w-24'
          aria-hidden
        />
        <div
          className='pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent sm:w-24'
          aria-hidden
        />

        <div className='flex w-max animate-press-marquee group-hover/marquee:paused motion-reduce:animate-none'>
          <div className={cn('flex items-center', PRESS_MARQUEE_GAP_CLASS)}>
            {pressItems.map((item) => (
              <PressLogo key={item.alt} item={item} />
            ))}
          </div>
          <div
            className={cn('flex items-center', PRESS_MARQUEE_GAP_CLASS)}
            aria-hidden
          >
            {pressItems.map((item) => (
              <PressLogo key={`${item.alt}-clone`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PressLogos
