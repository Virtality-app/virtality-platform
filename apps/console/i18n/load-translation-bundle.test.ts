import { describe, expect, it, vi } from 'vitest'

let orpc: () => unknown = () => ({})
vi.mock('@virtality/react-query', () => ({
  getORPC: () => orpc(),
}))

import { loadTranslationBundle } from './load-translation-bundle'

describe('loadTranslationBundle', () => {
  it('returns the API bundle as nested messages', async () => {
    const call = vi.fn().mockResolvedValue({ 'btn.save': 'Αποθήκευση' })
    orpc = () => ({ translation: { bundle: { call } } })

    expect(await loadTranslationBundle('el', 'common')).toEqual({
      btn: { save: 'Αποθήκευση' },
    })
    expect(call).toHaveBeenCalledWith({ locale: 'el', namespace: 'common' })
  })

  it('falls back to the catalog English when the client is unavailable', async () => {
    orpc = () => {
      throw new Error('ORPC not available')
    }

    expect(
      await loadTranslationBundle('el', 'patient-dashboard'),
    ).toMatchObject({
      'start-btn': 'Start',
      'pause-btn': 'Pause',
    })
  })
})
