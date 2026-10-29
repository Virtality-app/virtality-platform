import { createInstance } from 'i18next'
import {
  greekDrafts,
  translationCatalog,
  unflattenMessages,
  type FlatMessages,
  type TranslationNamespace,
} from '@virtality/shared/translations'
import type { Translate } from './translate'

const NAMESPACES = Object.keys(translationCatalog) as TranslationNamespace[]

const bundles = (catalog: Record<TranslationNamespace, FlatMessages>) =>
  Object.fromEntries(
    NAMESPACES.map((ns) => [ns, unflattenMessages(catalog[ns])]),
  )

/**
 * A synchronous `t` backed by the repo catalog (English) or the Greek drafts,
 * for tests and other code that has no running i18next instance. `defaultNs`
 * is the namespace plain keys resolve in.
 */
export function createCatalogTranslate(
  defaultNs: TranslationNamespace,
  language: 'en' | 'el' = 'en',
): Translate {
  const instance = createInstance()
  void instance.init({
    lng: language,
    fallbackLng: 'en',
    defaultNS: defaultNs,
    ns: NAMESPACES,
    resources: { en: bundles(translationCatalog), el: bundles(greekDrafts) },
    interpolation: { escapeValue: false },
    initAsync: false,
  })
  return (key, options) => instance.t(key, options) as string
}
