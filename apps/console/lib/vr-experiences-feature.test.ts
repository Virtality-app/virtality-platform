import { describe, expect, it } from 'vitest'
import { resolveVrExperiencesNavEnabled } from './vr-experiences-feature.ts'

describe('resolveVrExperiencesNavEnabled', () => {
  it('defaults to enabled when the flag is unset', () => {
    expect(resolveVrExperiencesNavEnabled(undefined)).toBe(true)
  })

  it('hides the link when the flag is false', () => {
    expect(resolveVrExperiencesNavEnabled('false')).toBe(false)
    expect(resolveVrExperiencesNavEnabled('0')).toBe(false)
  })

  it('ignores an unrecognised value', () => {
    expect(resolveVrExperiencesNavEnabled('nope')).toBe(true)
  })
})
