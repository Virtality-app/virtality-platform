import { afterEach, describe, expect, it, vi } from 'vitest'

let orpc: () => unknown = () => ({})
vi.mock('@virtality/react-query', () => ({
  // Setting up a client changes nothing here: getORPC keeps its mocked result.
  configureORPC: () => {},
  getORPC: () => orpc(),
}))

import { loadTranslationBundle } from './load-translation-bundle'

describe('loadTranslationBundle', () => {
  it('returns the API bundle as nested messages', async () => {
    const call = vi.fn().mockResolvedValue({ 'btn.save': 'Αποθήκευση' })
    orpc = () => ({ translation: { bundle: { call } } })

    expect(await loadTranslationBundle('el', 'common')).toMatchObject({
      btn: { save: 'Αποθήκευση' },
    })
    expect(call).toHaveBeenCalledWith({ locale: 'el', namespace: 'common' })
  })

  it('keeps the catalog English for keys the API does not know yet', async () => {
    const call = vi.fn().mockResolvedValue({ 'controls.cast': 'Προβολή' })
    orpc = () => ({ translation: { bundle: { call } } })

    expect(
      await loadTranslationBundle('el', 'patient-dashboard'),
    ).toMatchObject({
      controls: { cast: 'Προβολή', start: 'Start session' },
    })
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

  describe('while the API is unreachable', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('retries instead of keeping English as the language', async () => {
      vi.useFakeTimers()
      const call = vi
        .fn()
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValue({ 'btn.save': 'Αποθήκευση' })
      orpc = () => ({ translation: { bundle: { call } } })

      const loading = loadTranslationBundle('el', 'common')
      await vi.runAllTimersAsync()

      expect(await loading).toMatchObject({ btn: { save: 'Αποθήκευση' } })
      expect(call).toHaveBeenCalledTimes(3)
    })

    it('does not retry an API error', async () => {
      const call = vi.fn().mockRejectedValue(new Error('Unknown namespace'))
      orpc = () => ({ translation: { bundle: { call } } })

      await loadTranslationBundle('el', 'patient-dashboard')
      expect(call).toHaveBeenCalledOnce()
    })
  })
})
