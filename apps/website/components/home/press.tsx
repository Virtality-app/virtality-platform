'use client'

import CredibilityLogo from '@/components/home/credibility-logo'
import CredibilitySectionHeader from '@/components/home/credibility-section-header'
import {
  PRESS_LOGO_ITEMS,
  PRESS_SECTION_CONTENT,
} from '@/lib/partner-press-content'
import { filterValidLogoItems, getPressLinkProps } from '@/lib/partner-press'

const Press = () => {
  const pressItems = filterValidLogoItems(PRESS_LOGO_ITEMS)

  if (pressItems.length === 0) {
    return null
  }

  return (
    <section className='relative overflow-hidden bg-white py-20'>
      <div className='container m-auto px-4 md:px-8'>
        <CredibilitySectionHeader content={PRESS_SECTION_CONTENT} />

        <div className='flex flex-wrap items-center justify-center gap-10'>
          {pressItems.map((item) => {
            const logo = <CredibilityLogo item={item} size='primary' />
            const href = item.href?.trim()

            if (!href) {
              return (
                <div key={item.alt} className='inline-flex'>
                  {logo}
                </div>
              )
            }

            return (
              <a
                key={item.alt}
                href={href}
                {...getPressLinkProps(href)}
                className='inline-flex'
              >
                {logo}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Press
