import enAuth from './en/auth.json' with { type: 'json' }
import enAvatar from './en/avatar.json' with { type: 'json' }
import enCommon from './en/common.json' with { type: 'json' }
import enDevices from './en/devices.json' with { type: 'json' }
import enGlossary from './en/glossary.json' with { type: 'json' }
import enPatients from './en/patients.json' with { type: 'json' }
import enPatientDashboard from './en/patient-dashboard.json' with { type: 'json' }
import enPrograms from './en/programs.json' with { type: 'json' }
import enUser from './en/user.json' with { type: 'json' }
import enValidation from './en/validation.json' with { type: 'json' }
import enVrVideo from './en/vr-video.json' with { type: 'json' }
import elAuth from './el/auth.json' with { type: 'json' }
import elAvatar from './el/avatar.json' with { type: 'json' }
import elCommon from './el/common.json' with { type: 'json' }
import elDevices from './el/devices.json' with { type: 'json' }
import elGlossary from './el/glossary.json' with { type: 'json' }
import elPatients from './el/patients.json' with { type: 'json' }
import elPatientDashboard from './el/patient-dashboard.json' with { type: 'json' }
import elPrograms from './el/programs.json' with { type: 'json' }
import elUser from './el/user.json' with { type: 'json' }
import elValidation from './el/validation.json' with { type: 'json' }
import elVrVideo from './el/vr-video.json' with { type: 'json' }

export const TRANSLATION_LOCALES = ['en', 'el'] as const
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number]

export const TRANSLATION_NAMESPACES = [
  'auth',
  'avatar',
  'common',
  'devices',
  'glossary',
  'patient-dashboard',
  'patients',
  'programs',
  'user',
  'validation',
  'vr-video',
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
  auth: flatten(enAuth),
  avatar: flatten(enAvatar),
  common: flatten(enCommon),
  devices: flatten(enDevices),
  glossary: flatten(enGlossary),
  'patient-dashboard': flatten(enPatientDashboard),
  patients: flatten(enPatients),
  programs: flatten(enPrograms),
  user: flatten(enUser),
  validation: flatten(enValidation),
  'vr-video': flatten(enVrVideo),
}

/** Greek drafts, served until a human approves or edits a key. */
export const greekDrafts: Record<TranslationNamespace, FlatMessages> = {
  auth: flatten(elAuth),
  avatar: flatten(elAvatar),
  common: flatten(elCommon),
  devices: flatten(elDevices),
  glossary: flatten(elGlossary),
  'patient-dashboard': flatten(elPatientDashboard),
  patients: flatten(elPatients),
  programs: flatten(elPrograms),
  user: flatten(elUser),
  validation: flatten(elValidation),
  'vr-video': flatten(elVrVideo),
}
