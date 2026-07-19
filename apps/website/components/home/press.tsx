'use client'

import CredibilityLogo from '@/components/home/credibility-logo'
import CredibilitySectionHeader from '@/components/home/credibility-section-header'
import {
  PRESS_LOGO_ITEMS,
  PRESS_SECTION_CONTENT,
  type PressLogoItem,
} from '@/lib/partner-press-content'
import { filterValidLogoItems, getPressLinkProps } from '@/lib/partner-press'

function PressLogo({ item }: { item: PressLogoItem }) {
  const logo = (
    <CredibilityLogo
      item={item}
      size='primary'
      className='h-14 w-40 md:h-20 md:w-56'
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

const Press = () => {
  const pressItems = filterValidLogoItems(PRESS_LOGO_ITEMS)

  if (pressItems.length === 0) {
    return null
  }

  return (
    <section className='relative overflow-hidden bg-white py-20'>
      <div className='container m-auto px-4 md:px-8'>
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
            <div className='flex items-center gap-6 pe-6 md:gap-10 md:pe-10'>
              {pressItems.map((item) => (
                <PressLogo key={item.alt} item={item} />
              ))}
            </div>
            <div
              className='flex items-center gap-6 pe-6 md:gap-10 md:pe-10'
              aria-hidden
            >
              {pressItems.map((item) => (
                <PressLogo key={`${item.alt}-clone`} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Press
