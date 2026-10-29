import { createCatalogTranslate } from './catalog-translate'

/**
 * Stand-in for `@/i18n/use-client-t` in component tests: the translation
 * backend is a network boundary, so tests read the repo catalog instead.
 * Use inside `vi.mock('@/i18n/use-client-t', ...)`.
 */
export function catalogUseClientT(language: 'en' | 'el' = 'en') {
  const t = createCatalogTranslate('user', language)
  return { useClientT: () => ({ t, i18n: { language } }) }
}
