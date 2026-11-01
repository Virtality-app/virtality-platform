'use client'

// Initializes the shared instance, which is the default outside a provider.
import '@/i18n/i18next'
import { useTranslation, UseTranslationOptions } from 'react-i18next'

/** Translations from the instance `LanguageProvider` supplies. */
export function useClientT(
  ns: string | string[] = 'common',
  options?: UseTranslationOptions<string>,
) {
  return useTranslation(ns, options)
}
