import {
  greekDrafts,
  TRANSLATION_LOCALES,
  TRANSLATION_NAMESPACES,
  translationCatalog,
  type FlatMessages,
  type TranslationLocale,
  type TranslationNamespace,
} from '../../translations/index.ts'

export type TranslationStatus = 'missing' | 'needs-review' | 'outdated' | 'done'

export type TranslationRecord = {
  id: string
  locale: string
  namespace: string
  key: string
  value: string
  sourceHash: string
  updatedById: string | null
  createdAt: Date
  updatedAt: Date
}

export type TranslationStore = {
  listByLocale: (
    locale: string,
    namespace?: string,
  ) => Promise<TranslationRecord[]>
  upsert: (data: {
    locale: string
    namespace: string
    key: string
    value: string
    sourceHash: string
    updatedById: string | null
  }) => Promise<TranslationRecord>
  deleteByKey: (data: {
    locale: string
    namespace: string
    key: string
  }) => Promise<void>
}

export type TranslationCatalog = {
  english: Record<string, FlatMessages>
  greekDrafts: Record<string, FlatMessages>
}

export type TranslationListItem = {
  locale: TranslationLocale
  namespace: TranslationNamespace
  key: string
  english: string
  greekDraft: string | null
  value: string | null
  status: TranslationStatus
}

export const defaultTranslationCatalog: TranslationCatalog = {
  english: translationCatalog,
  greekDrafts,
}

export class TranslationValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TranslationValidationError'
  }
}

/** Short, stable hash (cyrb53) of the English a value was translated from. */
export function hashSourceText(text: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
}

export function extractPlaceholders(text: string): string[] {
  const found = new Set<string>()
  for (const match of text.matchAll(/\{\{\s*([^}\s]+)\s*\}\}/g)) {
    found.add(match[1]!)
  }
  return [...found].sort()
}

/** Placeholders in `english` that `value` does not keep. */
export function findMissingPlaceholders(
  english: string,
  value: string,
): string[] {
  const kept = new Set(extractPlaceholders(value))
  return extractPlaceholders(english).filter((name) => !kept.has(name))
}

export function isTranslationLocale(
  locale: string,
): locale is TranslationLocale {
  return (TRANSLATION_LOCALES as readonly string[]).includes(locale)
}

export function isTranslationNamespace(
  namespace: string,
): namespace is TranslationNamespace {
  return (TRANSLATION_NAMESPACES as readonly string[]).includes(namespace)
}

function assertCatalogLocale(
  locale: string,
): asserts locale is TranslationLocale {
  if (!isTranslationLocale(locale)) {
    throw new TranslationValidationError(`Unsupported locale "${locale}".`)
  }
}

function assertCatalogNamespace(
  namespace: string,
  catalog: TranslationCatalog,
): void {
  if (!Object.hasOwn(catalog.english, namespace)) {
    throw new TranslationValidationError(`Unknown namespace "${namespace}".`)
  }
}

function assertCatalogKey(
  namespace: string,
  key: string,
  catalog: TranslationCatalog,
): string {
  assertCatalogNamespace(namespace, catalog)
  const english = catalog.english[namespace]![key]
  if (english === undefined) {
    throw new TranslationValidationError(
      `Unknown key "${key}" in namespace "${namespace}".`,
    )
  }
  return english
}

function assertPlaceholdersKept(english: string, value: string): void {
  const missing = findMissingPlaceholders(english, value)
  if (missing.length > 0) {
    throw new TranslationValidationError(
      `Value is missing placeholder(s): ${missing.map((name) => `{{${name}}}`).join(', ')}.`,
    )
  }
}

function draftFor(
  catalog: TranslationCatalog,
  locale: string,
  namespace: string,
  key: string,
): string | undefined {
  if (locale === 'en') return undefined
  return catalog.greekDrafts[namespace]?.[key]
}

export function getTranslationStatus(input: {
  english: string
  draft?: string | undefined
  row?: Pick<TranslationRecord, 'sourceHash'> | undefined
}): TranslationStatus {
  if (input.row) {
    return input.row.sourceHash === hashSourceText(input.english)
      ? 'done'
      : 'outdated'
  }
  return input.draft === undefined ? 'missing' : 'needs-review'
}

/** Catalog defaults (plus Greek drafts for `el`) with database rows on top. */
export async function getTranslationBundle(
  store: Pick<TranslationStore, 'listByLocale'>,
  input: { locale: string; namespace: string },
  catalog: TranslationCatalog = defaultTranslationCatalog,
): Promise<FlatMessages> {
  assertCatalogLocale(input.locale)
  assertCatalogNamespace(input.namespace, catalog)

  const english = catalog.english[input.namespace]!
  const bundle: FlatMessages = { ...english }

  for (const key of Object.keys(english)) {
    const draft = draftFor(catalog, input.locale, input.namespace, key)
    if (draft !== undefined) bundle[key] = draft
  }

  const rows = await store.listByLocale(input.locale, input.namespace)
  for (const row of rows) {
    if (Object.hasOwn(english, row.key)) bundle[row.key] = row.value
  }
  return bundle
}

export async function listTranslations(
  store: Pick<TranslationStore, 'listByLocale'>,
  filter: {
    locale?: string | undefined
    namespace?: string | undefined
    status?: TranslationStatus | undefined
  } = {},
  catalog: TranslationCatalog = defaultTranslationCatalog,
): Promise<TranslationListItem[]> {
  if (filter.locale !== undefined) assertCatalogLocale(filter.locale)
  if (filter.namespace !== undefined) {
    assertCatalogNamespace(filter.namespace, catalog)
  }

  const locales = filter.locale ? [filter.locale] : [...TRANSLATION_LOCALES]
  const namespaces = filter.namespace
    ? [filter.namespace]
    : Object.keys(catalog.english)
  const items: TranslationListItem[] = []

  const englishRows = locales.some((locale) => locale !== 'en')
    ? await store.listByLocale('en', filter.namespace)
    : []
  const englishByKey = new Map(
    englishRows.map((row) => [`${row.namespace}\u0000${row.key}`, row.value]),
  )

  for (const locale of locales) {
    const rows = await store.listByLocale(locale, filter.namespace)
    const rowsByKey = new Map(
      rows.map((row) => [`${row.namespace}\u0000${row.key}`, row]),
    )
    for (const namespace of namespaces) {
      for (const [key, english] of Object.entries(
        catalog.english[namespace]!,
      )) {
        const row = rowsByKey.get(`${namespace}\u0000${key}`)
        const draft = draftFor(catalog, locale, namespace, key)
        const sourceEnglish =
          locale === 'en'
            ? english
            : (englishByKey.get(`${namespace}\u0000${key}`) ?? english)
        const status =
          locale === 'en' && !row
            ? 'done'
            : getTranslationStatus({ english: sourceEnglish, draft, row })
        if (filter.status && filter.status !== status) continue
        items.push({
          locale: locale as TranslationLocale,
          namespace: namespace as TranslationNamespace,
          key,
          english,
          greekDraft: draft ?? null,
          value: row?.value ?? null,
          status,
        })
      }
    }
  }
  return items
}

export async function upsertTranslation(
  store: Pick<TranslationStore, 'upsert' | 'listByLocale'>,
  input: { locale: string; namespace: string; key: string; value: string },
  updatedById: string | null,
  catalog: TranslationCatalog = defaultTranslationCatalog,
): Promise<TranslationRecord> {
  assertCatalogLocale(input.locale)
  const english = assertCatalogKey(input.namespace, input.key, catalog)
  assertPlaceholdersKept(english, input.value)
  // A Greek value is translated from the English staff currently see, which
  // may be an override; editing that English later outdates the Greek.
  let sourceEnglish = english
  if (input.locale !== 'en') {
    const overrides = await store.listByLocale('en', input.namespace)
    sourceEnglish =
      overrides.find((row) => row.key === input.key)?.value ?? english
  }
  return store.upsert({
    ...input,
    sourceHash: hashSourceText(sourceEnglish),
    updatedById,
  })
}

export async function resetTranslation(
  store: Pick<TranslationStore, 'deleteByKey'>,
  input: { locale: string; namespace: string; key: string },
  catalog: TranslationCatalog = defaultTranslationCatalog,
): Promise<void> {
  assertCatalogLocale(input.locale)
  assertCatalogKey(input.namespace, input.key, catalog)
  await store.deleteByKey(input)
}
