import { describe, expect, it } from 'vitest'
import { createTestI18n } from '@/i18n/test-i18n'
import { bodyPartChipLabel, equipmentChipLabel } from './exercise-filter-labels'

describe('filter chip labels', () => {
  it('reads body parts and equipment from the catalog', () => {
    const i18n = createTestI18n('el')
    const t = i18n.t.bind(i18n)
    expect(bodyPartChipLabel(t, 'upper_limb')).toBe('Άνω άκρο')
    expect(bodyPartChipLabel(t, 'lower back')).toBe('Οσφυϊκή μοίρα')
    expect(equipmentChipLabel(t, 'thera-band')).toBe('Λάστιχο αντίστασης')
    expect(equipmentChipLabel(t, 'small_ball')).toBe('Μικρή μπάλα')
  })

  it('title-cases a value the catalog does not know', () => {
    const i18n = createTestI18n('el')
    const t = i18n.t.bind(i18n)
    expect(bodyPartChipLabel(t, 'left_hip')).toBe('Left Hip')
    expect(equipmentChipLabel(t, 'foam roller')).toBe('Foam Roller')
  })
})
