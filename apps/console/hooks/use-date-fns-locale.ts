'use client'

import { useClientT } from '@/i18n/use-client-t'
import { dateFnsLocale } from '@/lib/date-fns-locale'

/** The date-fns locale for the current language; follows language switches. */
export function useDateFnsLocale() {
  const { i18n } = useClientT()
  return dateFnsLocale(i18n.resolvedLanguage)
}
