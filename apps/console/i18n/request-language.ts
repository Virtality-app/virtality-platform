import acceptLanguage from 'accept-language'
import { settings } from './settings'

acceptLanguage.languages(settings.languages)

/**
 * The language a request renders in, decided the way the browser's language
 * detector decides it: the saved `i18next` cookie, then the browser's
 * languages. Server and browser must agree, or hydration fails.
 */
export function resolveRequestLanguage(
  cookie: string | undefined,
  acceptLanguageHeader: string | null,
): string {
  if (cookie && settings.languages.includes(cookie)) return cookie
  return acceptLanguage.get(acceptLanguageHeader) ?? settings.fallbackLng
}
