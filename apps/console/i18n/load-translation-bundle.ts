import { getORPC } from '@virtality/react-query'
import {
  translationCatalog,
  unflattenMessages,
  type TranslationNamespace,
} from '@virtality/shared/translations'

/** Loads a namespace from `translation.bundle`; falls back to the catalog's English. */
export async function loadTranslationBundle(
  language: string,
  namespace: string,
) {
  try {
    const bundle = await getORPC().translation.bundle.call({
      locale: language,
      namespace,
    })
    return unflattenMessages(bundle)
  } catch {
    const english = translationCatalog[namespace as TranslationNamespace]
    return english ? unflattenMessages(english) : {}
  }
}
