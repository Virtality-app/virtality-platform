import { describe, expect, it } from 'vitest'
import { equipmentIconSrcForItem } from './equipment-icon'

describe('equipment icons', () => {
  it.each([
    'small_ball',
    'Small ball',
    'Small balls',
    'small-ball',
    'SmallBall',
    ' small_ball ',
  ])('uses the small-ball icon for %s', (item) => {
    expect(equipmentIconSrcForItem(item)).toBe(
      '/assets/equipment/SMALL_BALLS_ICON.png',
    )
  })
  it('uses the rope icon', () => {
    expect(equipmentIconSrcForItem('Rope')).toBe(
      '/assets/equipment/ROPE_ICON.png',
    )
  })
})
