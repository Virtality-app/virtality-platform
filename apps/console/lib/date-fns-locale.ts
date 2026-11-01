import { el, enUS, type Locale } from 'date-fns/locale'

/** The date-fns locale for a console language (calendars, `format`). */
export function dateFnsLocale(language: string | undefined): Locale {
  return language?.startsWith('el') ? el : enUS
}
