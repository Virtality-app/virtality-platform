import { describe, expect, it } from 'vitest'
import {
  MARKETING_HIGHLIGHT_CARD_SEED,
  validateMarketingHighlightCardSeed,
} from './marketing-highlight-card-seed.ts'

describe('marketing highlight card seed', () => {
  it('accepts the canonical migration seed records', () => {
    expect(() =>
      validateMarketingHighlightCardSeed(MARKETING_HIGHLIGHT_CARD_SEED),
    ).not.toThrow()
  })

  it('requires six ordered cards per collection', () => {
    expect(() =>
      validateMarketingHighlightCardSeed([
        {
          id: '11111111-1111-4111-8111-111111110001',
          collection: 'benefits',
          title: 'Benefit',
          body: 'Body',
          iconName: 'Shield',
          sortOrder: 0,
        },
      ]),
    ).toThrow(/six/i)
  })

  it('requires contiguous sortOrder values starting at zero', () => {
    const records = MARKETING_HIGHLIGHT_CARD_SEED.map((record) => ({
      ...record,
    }))

    const firstBenefit = records.find(
      (record) => record.collection === 'benefits' && record.sortOrder === 0,
    )
    if (!firstBenefit) {
      throw new Error('expected a benefits seed record')
    }

    firstBenefit.sortOrder = 2

    expect(() => validateMarketingHighlightCardSeed(records)).toThrow(
      /sortOrder/i,
    )
  })
})
