import enAvatar from './en/avatar.json' with { type: 'json' }
import enCommon from './en/common.json' with { type: 'json' }
import enGlossary from './en/glossary.json' with { type: 'json' }
import enPatientDashboard from './en/patient-dashboard.json' with { type: 'json' }
import enValidation from './en/validation.json' with { type: 'json' }
import elAvatar from './el/avatar.json' with { type: 'json' }
import elCommon from './el/common.json' with { type: 'json' }
import elGlossary from './el/glossary.json' with { type: 'json' }
import elPatientDashboard from './el/patient-dashboard.json' with { type: 'json' }
import elValidation from './el/validation.json' with { type: 'json' }

export const TRANSLATION_LOCALES = ['en', 'el'] as const
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number]

export const TRANSLATION_NAMESPACES = [
  'avatar',
  'common',
  'glossary',
  'patient-dashboard',
  'validation',
] as const
export type TranslationNamespace = (typeof TRANSLATION_NAMESPACES)[number]

type NestedMessages = { [key: string]: string | NestedMessages }
export type FlatMessages = Record<string, string>

function flatten(messages: NestedMessages, prefix = ''): FlatMessages {
  const flat: FlatMessages = {}
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') flat[path] = value
    else Object.assign(flat, flatten(value, path))
  }
  return flat
}

/** Turns `{ 'btn.save': 'Save' }` back into `{ btn: { save: 'Save' } }`. */
export function unflattenMessages(flat: FlatMessages): NestedMessages {
  const nested: NestedMessages = {}
  for (const [path, value] of Object.entries(flat)) {
    const parts = path.split('.')
    let node = nested
    for (const part of parts.slice(0, -1)) {
      const existing = node[part]
      if (typeof existing === 'object') {
        node = existing
      } else {
        const child: NestedMessages = {}
        node[part] = child
        node = child
      }
    }
    node[parts[parts.length - 1]!] = value
  }
  return nested
}

/** English defaults: the one source of translation keys. */
export const translationCatalog: Record<TranslationNamespace, FlatMessages> = {
  avatar: flatten(enAvatar),
  common: flatten(enCommon),
  glossary: flatten(enGlossary),
  'patient-dashboard': flatten(enPatientDashboard),
  validation: flatten(enValidation),
}

/** Greek drafts, served until a human approves or edits a key. */
export const greekDrafts: Record<TranslationNamespace, FlatMessages> = {
  avatar: flatten(elAvatar),
  common: flatten(elCommon),
  glossary: flatten(elGlossary),
  'patient-dashboard': flatten(elPatientDashboard),
  validation: flatten(elValidation),
}
