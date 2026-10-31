import { describe, expect, it } from 'vitest'
import { translationCatalog } from '@virtality/shared/translations'
import {
  supplementalTherapyFallbackLabel,
  supplementalTherapyTranslationKey,
} from './supplemental-therapy-label'

describe('supplementalTherapyTranslationKey', () => {
  it.each([
    ['manual_therapy', 'sessionDialog.therapies.manual_therapy'],
    ['Dual Task Training', 'sessionDialog.therapies.dual_task_training'],
    ['PNF', 'sessionDialog.therapies.pnf'],
  ])('maps %s to a catalog key', (name, key) => {
    expect(supplementalTherapyTranslationKey(name)).toBe(key)
    expect(translationCatalog['patient-dashboard'][key]).toBeDefined()
  })
})

describe('supplementalTherapyFallbackLabel', () => {
  it('turns an unknown database key into a sentence-case label', () => {
    expect(supplementalTherapyFallbackLabel('cold_water_immersion')).toBe(
      'Cold water immersion',
    )
  })
})
