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
