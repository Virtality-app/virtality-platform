import { configureORPC, getORPC } from '@virtality/react-query'
import { getServerUrl, ORPC_PREFIX } from '@virtality/shared/types'
import { overCatalogEnglish } from './over-catalog-english'

/**
 * The oRPC client is set up when ORPCProvider renders, but i18next loads its
 * first bundles (common, validation, auth) as soon as it initializes, before
 * that on the server and in the browser. Those loads fell back to English
 * and stayed cached, so set the client up here the way the provider does.
 */
function bundleClient() {
  try {
    return getORPC()
  } catch {
    configureORPC({
      url: getServerUrl() + ORPC_PREFIX,
      fetch: (request, init) =>
        fetch(request, { ...init, credentials: 'include' }),
    })
    return getORPC()
  }
}

/** About 30s in all: long enough for the API to finish (re)starting. */
const RETRY_DELAYS_MS = [500, 1000, 2000, 4000, 8000, 16000]

/**
 * i18next keeps whatever a load returns for good, so a load made while the
 * API is unreachable (`fetch` throws a TypeError) waits and tries again
 * rather than storing the English fallback as this language. API errors,
 * such as an unknown namespace, are not retried.
 */
async function fetchBundle(language: string, namespace: string) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await bundleClient().translation.bundle.call({
        locale: language,
        namespace,
      })
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt]
      if (!(error instanceof TypeError) || delay === undefined) throw error
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}

/** Loads a namespace from `translation.bundle`; falls back to the catalog's English. */
export async function loadTranslationBundle(
  language: string,
  namespace: string,
) {
  try {
    return overCatalogEnglish(namespace, await fetchBundle(language, namespace))
  } catch {
    return overCatalogEnglish(namespace, {})
  }
}
