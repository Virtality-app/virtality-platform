'use client'

import { useState } from 'react'
import type { Resource } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import i18next from '@/i18n/i18next'

function addBundles(resources: Resource, language: string) {
  for (const [namespace, bundle] of Object.entries(resources[language] ?? {})) {
    i18next.addResourceBundle(language, namespace, bundle, true, true)
  }
}

/**
 * Renders client components in the request's language, with the text the
 * server loaded for this request (`loadServerTranslations`).
 *
 * On the server the shared i18next instance cannot detect a language and is
 * shared by every request, so each render gets its own copy in `language`.
 * In the browser the shared instance starts from the server's text and
 * language, so nothing waits on a load while hydrating; a component that
 * suspended there would hydrate later with newer data and not match.
 */
export function LanguageProvider({
  language,
  resources,
  children,
}: {
  language: string
  resources: Resource
  children: React.ReactNode
}) {
  const [i18n] = useState(() => {
    addBundles(resources, language)
    if (typeof window === 'undefined') {
      // initAsync: false switches the copy now, not on the next tick, which
      // is after this render.
      return i18next.cloneInstance({ lng: language, initAsync: false })
    }
    // What react-i18next's useSSR does: ready now, not when init's own
    // loads finish. changeLanguage sets the language synchronously when
    // init has not set one yet.
    i18next.initializedStoreOnce = true
    i18next.isInitialized = true
    void i18next.changeLanguage(language)
    return i18next
  })

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
