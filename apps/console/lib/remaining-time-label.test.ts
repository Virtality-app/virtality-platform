import { describe, expect, it } from 'vitest'
import { createTestI18n } from '@/i18n/test-i18n'
import { remainingTimeLabel } from './remaining-time-label.js'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

describe('remainingTimeLabel', () => {
  it('matches the English short form', () => {
    const i18n = createTestI18n()
    const t = i18n.t.bind(i18n)
    expect(remainingTimeLabel(t, 7 * DAY + 3 * HOUR)).toBe('7d 3h')
    expect(remainingTimeLabel(t, 0)).toBe('Expired')
  })

  it('words the units in Greek', () => {
    const i18n = createTestI18n('el')
    const t = i18n.t.bind(i18n)
    expect(remainingTimeLabel(t, 7 * DAY + 3 * HOUR)).toBe('7 ημ. 3 ώρ.')
    expect(remainingTimeLabel(t, 0)).toBe('Έληξε')
  })
})
