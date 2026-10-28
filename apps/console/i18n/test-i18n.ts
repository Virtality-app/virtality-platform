import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  greekDrafts,
  translationCatalog,
  unflattenMessages,
  type FlatMessages,
} from '@virtality/shared/translations'

const bundles = (catalog: Record<string, FlatMessages>) =>
  Object.fromEntries(
    Object.entries(catalog).map(([ns, flat]) => [ns, unflattenMessages(flat)]),
  )

/** An i18next instance with the catalog's English and Greek drafts, for tests. */
export function createTestI18n(lng: 'en' | 'el' = 'en') {
  const i18n = createInstance()
  void i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    resources: {
      en: bundles(translationCatalog),
      el: bundles(greekDrafts),
    },
    initImmediate: false,
  })
  return i18n
}

/** Shared test instance used as the global i18n in vitest setup. */
const testI18n = createInstance()

void testI18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'patient-dashboard',
  fallbackNS: 'patient-dashboard',
  interpolation: { escapeValue: false },
  resources: {
    en: bundles(translationCatalog),
    el: bundles(greekDrafts),
  },
})

export { testI18n }
