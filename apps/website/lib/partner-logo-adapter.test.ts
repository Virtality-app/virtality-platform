import { describe, expect, it } from 'vitest'
import type { PartnerLogoListItem } from '@virtality/shared/types'
import { getVisiblePartnerRows, hasPartnerSection } from './partner-press'
import { mapPartnerLogosToCredibilityLists } from './partner-logo-adapter'

describe('website partner logo adapter', () => {
  it('maps public list items into strategic and clinical credibility logo lists', () => {
    const items: PartnerLogoListItem[] = [
      {
        id: '1',
        objectKey: 'marketing/logos/strategic/a.png',
        alt: 'Strategic partner',
        category: 'strategic',
        sortOrder: 0,
        cdnUrl: 'https://cdn.example.com/marketing/logos/strategic/a.png',
      },
      {
        id: '2',
        objectKey: 'marketing/logos/clinical/b.png',
        alt: 'Clinical partner',
        category: 'clinical',
        sortOrder: 0,
        cdnUrl: 'https://cdn.example.com/marketing/logos/clinical/b.png',
      },
    ]

    expect(mapPartnerLogosToCredibilityLists(items)).toEqual({
      strategicLogos: [
        {
          src: 'https://cdn.example.com/marketing/logos/strategic/a.png',
          alt: 'Strategic partner',
        },
      ],
      clinicalLogos: [
        {
          src: 'https://cdn.example.com/marketing/logos/clinical/b.png',
          alt: 'Clinical partner',
        },
      ],
    })
  })

  it('keeps empty partner rows and the whole section hidden for invalid logos', () => {
    const { strategicLogos, clinicalLogos } = mapPartnerLogosToCredibilityLists(
      [
        {
          id: '1',
          objectKey: 'marketing/logos/strategic/missing-alt.png',
          alt: ' ',
          category: 'strategic',
          sortOrder: 0,
          cdnUrl:
            'https://cdn.example.com/marketing/logos/strategic/missing-alt.png',
        },
        {
          id: '2',
          objectKey: 'marketing/logos/clinical/missing-src.png',
          alt: 'Clinical partner',
          category: 'clinical',
          sortOrder: 0,
          cdnUrl: ' ',
        },
      ],
    )

    expect(getVisiblePartnerRows(strategicLogos, clinicalLogos)).toEqual([])
    expect(hasPartnerSection(strategicLogos, clinicalLogos)).toBe(false)
  })
})
