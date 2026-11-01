'use client'

import { useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18next from '@/i18n/i18next'

/**
 * Renders client components in the request's language. The shared i18next
 * instance cannot detect a language on the server and is shared by every
 * request there, so each server render gets its own copy in `language`. In
 * the browser the shared instance is used; it reads the same cookie.
 */
export function LanguageProvider({
  language,
  children,
}: {
  language: string
  children: React.ReactNode
}) {
  const [i18n] = useState(() =>
    typeof window === 'undefined'
      ? // initAsync: false switches the copy now, not on the next tick, which
        // is after this render.
        i18next.cloneInstance({ lng: language, initAsync: false })
      : i18next,
  )

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
