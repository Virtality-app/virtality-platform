import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { z } from 'zod/v4'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { loadTranslationBundle } from './load-translation-bundle'
import { settings } from './settings'
import { createZodErrorMap } from './zod-error-map'

const { fallbackLng, languages, defaultNS } = settings

const runsOnServerSide = typeof window === 'undefined'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend(loadTranslationBundle))
  .init({
    // debug: true,
    ns: ['common', 'validation'],
    supportedLngs: languages,
    fallbackLng,
    fallbackNS: defaultNS,
    defaultNS,
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    preload: runsOnServerSide ? languages : [],
  })

// The one place Zod issues become translated messages.
z.config({
  customError: createZodErrorMap((key, options) => i18next.t(key, options)),
})

export default i18next
