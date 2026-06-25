import { describe, expect, it } from 'vitest'
import { canQuickStartFinalAction } from './quickstart-authoring-flow.js'

const variants = [
  { id: 'left', exerciseId: 'squat-left' },
  { id: 'right', exerciseId: 'squat-right' },
]

describe('quick start final action guards', () => {
  it('blocks final actions when no exercises are selected', () => {
    expect(canQuickStartFinalAction([], [])).toBe(false)
  })

  it('blocks final actions when every selected variant is deferred for removal', () => {
    expect(canQuickStartFinalAction(variants, ['left', 'right'])).toBe(false)
  })

  it('allows final actions when at least one enabled variant remains', () => {
    expect(canQuickStartFinalAction(variants, ['left'])).toBe(true)
    expect(canQuickStartFinalAction(variants, [])).toBe(true)
  })
})
