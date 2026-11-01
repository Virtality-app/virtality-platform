import { configureORPC, getORPC } from '@virtality/react-query'
import { getServerUrl, ORPC_PREFIX } from '@virtality/shared/types'
import {
  translationCatalog,
  unflattenMessages,
  type TranslationNamespace,
} from '@virtality/shared/translations'

/**
 * The browser's client comes from ORPCProvider. A server render has none
 * until a provider renders, which is after i18next loads its first bundles,
 * so the server points the client at the API itself (`translation.bundle`
 * is public). Without this every server render fell back to English.
 */
function bundleClient() {
  if (typeof window === 'undefined') {
    try {
      return getORPC()
    } catch {
      configureORPC({ url: getServerUrl() + ORPC_PREFIX })
    }
  }
  return getORPC()
}

/** Loads a namespace from `translation.bundle`; falls back to the catalog's English. */
export async function loadTranslationBundle(
  language: string,
  namespace: string,
) {
  try {
    const bundle = await bundleClient().translation.bundle.call({
      locale: language,
      namespace,
    })
    return unflattenMessages(bundle)
  } catch {
    const english = translationCatalog[namespace as TranslationNamespace]
    return english ? unflattenMessages(english) : {}
  }
}
