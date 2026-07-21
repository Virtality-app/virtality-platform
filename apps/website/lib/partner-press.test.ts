import { describe, expect, it } from 'vitest'
import {
  filterValidLogoItems,
  getPressLinkProps,
  getVisiblePartnerRows,
  hasPartnerSection,
  hasPressSection,
  isValidLogoItem,
} from './partner-press'

describe('partner and press visibility helpers', () => {
  it('treats logo items as valid only when src and alt are present', () => {
    expect(isValidLogoItem({ src: '/logo.png', alt: 'Partner' })).toBe(true)
    expect(isValidLogoItem({ src: ' ', alt: 'Partner' })).toBe(false)
    expect(isValidLogoItem({ src: '/logo.png', alt: '' })).toBe(false)
    expect(
      filterValidLogoItems([
        { src: '/a.png', alt: 'A' },
        { src: '', alt: 'B' },
      ]),
    ).toEqual([{ src: '/a.png', alt: 'A' }])
  })

  it('hides partner rows when no valid logo items exist', () => {
    expect(getVisiblePartnerRows([], [])).toEqual([])
    expect(
      getVisiblePartnerRows(
        [{ src: ' ', alt: 'Missing asset' }],
        [{ src: '', alt: 'Also missing' }],
      ),
    ).toEqual([])
    expect(hasPartnerSection([], [])).toBe(false)
  })

  it('includes strategic and clinical rows only when valid logos exist', () => {
    const strategic = [{ src: '/strategic.png', alt: 'Strategic partner' }]
    const clinical = [
      { src: '/clinical.png', alt: 'Clinical partner', wide: true },
    ]

    expect(getVisiblePartnerRows(strategic, [])).toEqual([
      { kind: 'strategic', logos: strategic },
    ])
    expect(getVisiblePartnerRows([], clinical)).toEqual([
      { kind: 'clinical', logos: clinical },
    ])
    expect(getVisiblePartnerRows(strategic, clinical)).toEqual([
      { kind: 'strategic', logos: strategic },
      { kind: 'clinical', logos: clinical },
    ])
    expect(hasPartnerSection(strategic, clinical)).toBe(true)
  })

  it('hides the press section when no valid press items exist', () => {
    expect(hasPressSection([])).toBe(false)
    expect(hasPressSection([{ src: '', alt: 'Missing press logo' }])).toBe(
      false,
    )
  })

  it('opens press items with URLs in a new tab', () => {
    expect(getPressLinkProps('https://example.com/article')).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    })
    expect(getPressLinkProps()).toEqual({})
    expect(getPressLinkProps('   ')).toEqual({})
  })
})
