// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

const call = vi
  .fn()
  .mockResolvedValue({ 'signIn.title': 'Σύνδεση στο Virtality' })
let configured: unknown = null
const configureORPC = vi.fn((link: unknown) => {
  configured = link
})
vi.mock('@virtality/react-query', () => ({
  configureORPC: (link: unknown) => configureORPC(link),
  getORPC: () => {
    if (!configured) throw new Error('ORPC not available')
    return { translation: { bundle: { call } } }
  },
}))

import { loadTranslationBundle } from './load-translation-bundle'

describe('loadTranslationBundle on the server', () => {
  it('points the client at the API instead of falling back to English', async () => {
    expect(await loadTranslationBundle('el', 'auth')).toEqual({
      signIn: { title: 'Σύνδεση στο Virtality' },
    })
    expect(configureORPC).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ url: 'http://localhost:8080/api/v1/rpc' }),
    )
  })

  it('reuses the client it configured', async () => {
    await loadTranslationBundle('el', 'auth')
    expect(configureORPC).toHaveBeenCalledOnce()
  })
})
