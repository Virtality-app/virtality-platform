import type { TranslationListItem } from '@virtality/shared/utils'
import { describe, expect, it } from 'vitest'
import {
  buildTranslationRows,
  buildTranslationColumnFilters,
  missingPlaceholders,
} from './translation-rows'

function item(partial: Partial<TranslationListItem>): TranslationListItem {
  return {
    locale: 'el',
    namespace: 'common',
    key: 'hi',
    english: 'Hello {{name}}',
    greekDraft: null,
    value: null,
    status: 'missing',
    ...partial,
  }
}

describe('buildTranslationRows', () => {
  it('joins the Greek row with the English override of the same key', () => {
    const rows = buildTranslationRows([
      item({ locale: 'en', value: 'Howdy {{name}}', status: 'done' }),
      item({ greekDraft: 'Γεια {{name}}', status: 'needs-review' }),
    ])
    expect(rows).toEqual([
      {
        id: 'common:hi',
        namespace: 'common',
        key: 'hi',
        defaultEnglish: 'Hello {{name}}',
        english: 'Howdy {{name}}',
        englishOverridden: true,
        greek: 'Γεια {{name}}',
        greekValue: null,
        greekDraft: 'Γεια {{name}}',
        status: 'needs-review',
      },
    ])
  })

  it('shows the saved Greek over the draft and the default English without an override', () => {
    const [row] = buildTranslationRows([
      item({ locale: 'en', status: 'done' }),
      item({ greekDraft: 'draft', value: 'saved', status: 'done' }),
    ])
    expect(row).toMatchObject({
      english: 'Hello {{name}}',
      englishOverridden: false,
      greek: 'saved',
    })
  })

  it('leaves Greek empty for a missing key', () => {
    const [row] = buildTranslationRows([item({})])
    expect(row?.greek).toBe('')
  })
})

describe('missingPlaceholders', () => {
  it('names the placeholders a value dropped', () => {
    expect(missingPlaceholders('{{a}} and {{b}}', 'only {{a}}')).toEqual(['b'])
  })
})

describe('buildTranslationColumnFilters', () => {
  it('emits only the active filters', () => {
    expect(buildTranslationColumnFilters([], ['missing'])).toEqual([
      { id: 'status', value: ['missing'] },
    ])
    expect(buildTranslationColumnFilters([], [])).toEqual([])
  })
})
