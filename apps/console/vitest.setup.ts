import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Translated strings resolve against the catalog's English, with no network.
vi.mock('@/i18n/i18next', async () => {
  const { testI18n } = await import('./i18n/test-i18n')
  return { default: testI18n }
})
