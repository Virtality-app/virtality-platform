import { describe, expect, it } from 'vitest'
import { getClosestMiddleIndex } from './testimonial-carousel'

describe('getClosestMiddleIndex', () => {
  it('returns the middle index for an odd count', () => {
    expect(getClosestMiddleIndex(1)).toBe(0)
    expect(getClosestMiddleIndex(3)).toBe(1)
    expect(getClosestMiddleIndex(5)).toBe(2)
  })

  it('returns the lower middle index for an even count', () => {
    expect(getClosestMiddleIndex(2)).toBe(0)
    expect(getClosestMiddleIndex(4)).toBe(1)
    expect(getClosestMiddleIndex(6)).toBe(2)
  })

  it('returns 0 for an empty list', () => {
    expect(getClosestMiddleIndex(0)).toBe(0)
  })
})
