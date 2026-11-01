import type { Resource, ResourceLanguage } from 'i18next'
import { getServerUrl, ORPC_PREFIX } from '@virtality/shared/types'
import {
  TRANSLATION_NAMESPACES,
  unflattenMessages,
  type FlatMessages,
} from '@virtality/shared/translations'

/**
 * One namespace from `translation.bundle`, called over the API's RPC wire
 * format so a Server Component needs no oRPC client. Null when it fails.
 */
async function fetchBundle(language: string, namespace: string) {
  try {
    const response = await fetch(
      `${getServerUrl()}${ORPC_PREFIX}/translation/bundle`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ json: { locale: language, namespace } }),
        cache: 'no-store',
      },
    )
    if (!response.ok) return null
    const { json } = (await response.json()) as { json: FlatMessages }
    return unflattenMessages(json)
  } catch {
    return null
  }
}

/**
 * Every namespace in `language`, fetched for each page load and handed to
 * LanguageProvider, so the server renders current text and the browser
 * hydrates with the same text without waiting on a load. A namespace that
 * fails is left out; it then loads the usual way.
 */
export async function loadServerTranslations(
  language: string,
): Promise<Resource> {
  const bundles: ResourceLanguage = {}
  await Promise.all(
    TRANSLATION_NAMESPACES.map(async (namespace) => {
      const bundle = await fetchBundle(language, namespace)
      if (bundle) bundles[namespace] = bundle
    }),
  )
  return { [language]: bundles }
}
