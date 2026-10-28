import type { ColumnFiltersState } from '@tanstack/react-table'
import {
  findMissingPlaceholders,
  type TranslationListItem,
  type TranslationStatus,
} from '@virtality/shared/utils'

export type TranslationTableRow = {
  id: string
  namespace: string
  key: string
  defaultEnglish: string
  /** The English staff see: the saved override, else the repo default. */
  english: string
  englishOverridden: boolean
  /** The Greek the console serves: saved value, else the draft. */
  greek: string
  greekValue: string | null
  greekDraft: string | null
  status: TranslationStatus
}

export const TRANSLATION_STATUSES: TranslationStatus[] = [
  'missing',
  'needs-review',
  'outdated',
  'done',
]

export const TRANSLATION_STATUS_LABELS: Record<TranslationStatus, string> = {
  missing: 'Missing',
  'needs-review': 'Needs review',
  outdated: 'Outdated',
  done: 'Done',
}

/** One row per key: the Greek item joined with the English item's override. */
export function buildTranslationRows(
  items: TranslationListItem[],
): TranslationTableRow[] {
  const idOf = (item: TranslationListItem) => `${item.namespace}:${item.key}`
  const overrides = new Map(
    items
      .filter((item) => item.locale === 'en')
      .map((item) => [idOf(item), item.value]),
  )
  return items
    .filter((item) => item.locale === 'el')
    .map((item) => {
      const override = overrides.get(idOf(item)) ?? null
      return {
        id: idOf(item),
        namespace: item.namespace,
        key: item.key,
        defaultEnglish: item.english,
        english: override ?? item.english,
        englishOverridden: override !== null,
        greek: item.value ?? item.greekDraft ?? '',
        greekValue: item.value,
        greekDraft: item.greekDraft,
        status: item.status,
      }
    })
}

export function missingPlaceholders(english: string, value: string) {
  return findMissingPlaceholders(english, value)
}

export function distinctNamespaces(rows: TranslationTableRow[]): string[] {
  return [...new Set(rows.map((row) => row.namespace))].sort()
}

export function buildTranslationColumnFilters(
  namespaces: string[],
  statuses: TranslationStatus[],
): ColumnFiltersState {
  return [
    ...(namespaces.length > 0 ? [{ id: 'namespace', value: namespaces }] : []),
    ...(statuses.length > 0 ? [{ id: 'status', value: statuses }] : []),
  ]
}
