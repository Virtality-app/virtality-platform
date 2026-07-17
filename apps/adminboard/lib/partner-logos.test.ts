import type { PartnerLogoListItem } from '@virtality/shared/types'
import { describe, expect, it } from 'vitest'
import { groupPartnerLogosByCategory } from './partner-logos'

const logos: PartnerLogoListItem[] = [
  {
    id: '1',
    objectKey: 'marketing/logos/strategic/second.png',
    alt: 'Strategic two',
    category: 'strategic',
    sortOrder: 1,
    cdnUrl: 'https://cdn.example/marketing/logos/strategic/second.png',
  },
  {
    id: '2',
    objectKey: 'marketing/logos/clinical/first.png',
    alt: 'Clinical one',
    category: 'clinical',
    sortOrder: 0,
    cdnUrl: 'https://cdn.example/marketing/logos/clinical/first.png',
  },
  {
    id: '3',
    objectKey: 'marketing/logos/strategic/first.png',
    alt: 'Strategic one',
    category: 'strategic',
    sortOrder: 0,
    cdnUrl: 'https://cdn.example/marketing/logos/strategic/first.png',
  },
]

describe('groupPartnerLogosByCategory', () => {
  it('splits logos into strategic and clinical lists ordered by sortOrder', () => {
    expect(groupPartnerLogosByCategory(logos)).toEqual({
      strategic: [logos[2], logos[0]],
      clinical: [logos[1]],
    })
  })

  it('returns empty lists when no logos exist', () => {
    expect(groupPartnerLogosByCategory([])).toEqual({
      strategic: [],
      clinical: [],
    })
  })
})
