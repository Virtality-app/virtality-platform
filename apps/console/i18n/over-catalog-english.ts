import {
  translationCatalog,
  unflattenMessages,
  type FlatMessages,
  type TranslationNamespace,
} from '@virtality/shared/translations'

/**
 * An API bundle laid over the English this console was built with. The API
 * only knows the keys of the catalog it was built with, so a console newer
 * than its API (a PR preview against staging, or a console deployed before
 * the API) would otherwise show a new key's name, such as `controls.start`.
 */
export function overCatalogEnglish(namespace: string, bundle: FlatMessages) {
  const english = translationCatalog[namespace as TranslationNamespace] ?? {}
  return unflattenMessages({ ...english, ...bundle })
}
