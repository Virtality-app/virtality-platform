import { describe, expect, it } from 'vitest'
import {
  greekDrafts,
  translationCatalog,
  TRANSLATION_NAMESPACES,
} from '../../translations/index.ts'
import {
  extractPlaceholders,
  findMissingPlaceholders,
  getTranslationBundle,
  getTranslationStatus,
  hashSourceText,
  listTranslations,
  resetTranslation,
  TranslationValidationError,
  upsertTranslation,
  type TranslationCatalog,
  type TranslationRecord,
  type TranslationStore,
} from './translation.ts'

const catalog: TranslationCatalog = {
  english: { common: { hi: 'Hello {{name}}', bye: 'Bye', new: 'New' } },
  greekDrafts: { common: { hi: 'Γεια {{name}}', bye: 'Αντίο' } },
}

function row(partial: Partial<TranslationRecord>): TranslationRecord {
  return {
    id: 'r',
    locale: 'el',
    namespace: 'common',
    key: 'hi',
    value: 'Χαίρε {{name}}',
    sourceHash: hashSourceText('Hello {{name}}'),
    updatedById: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...partial,
  }
}

function createStore(rows: TranslationRecord[] = []) {
  const same = (
    r: TranslationRecord,
    d: { locale: string; namespace: string; key: string },
  ) => r.locale === d.locale && r.namespace === d.namespace && r.key === d.key
  const store: TranslationStore & { rows: TranslationRecord[] } = {
    rows,
    listByLocale: async (locale, namespace) =>
      store.rows.filter(
        (r) => r.locale === locale && (!namespace || r.namespace === namespace),
      ),
    upsert: async (data) => {
      const saved = row({ ...data })
      store.rows = [...store.rows.filter((r) => !same(r, data)), saved]
      return saved
    },
    deleteByKey: async (data) => {
      store.rows = store.rows.filter((r) => !same(r, data))
    },
  }
  return store
}

describe('getTranslationBundle', () => {
  it('serves English defaults for en', async () => {
    const bundle = await getTranslationBundle(
      createStore(),
      { locale: 'en', namespace: 'common' },
      catalog,
    )
    expect(bundle).toEqual({ hi: 'Hello {{name}}', bye: 'Bye', new: 'New' })
  })

  it('serves Greek drafts over English for el, falling back to English', async () => {
    const bundle = await getTranslationBundle(
      createStore(),
      { locale: 'el', namespace: 'common' },
      catalog,
    )
    expect(bundle).toEqual({ hi: 'Γεια {{name}}', bye: 'Αντίο', new: 'New' })
  })

  it('applies database rows over drafts and ignores unknown keys', async () => {
    const bundle = await getTranslationBundle(
      createStore([row({}), row({ key: 'ghost', value: 'x' })]),
      { locale: 'el', namespace: 'common' },
      catalog,
    )
    expect(bundle.hi).toBe('Χαίρε {{name}}')
    expect(bundle).not.toHaveProperty('ghost')
  })

  it('rejects namespaces and locales outside the catalog', async () => {
    await expect(
      getTranslationBundle(
        createStore(),
        { locale: 'el', namespace: 'x' },
        catalog,
      ),
    ).rejects.toBeInstanceOf(TranslationValidationError)
    await expect(
      getTranslationBundle(
        createStore(),
        { locale: 'fr', namespace: 'common' },
        catalog,
      ),
    ).rejects.toBeInstanceOf(TranslationValidationError)
  })
})

describe('translation status', () => {
  it('is missing without draft or row', () => {
    expect(getTranslationStatus({ english: 'A' })).toBe('missing')
  })
  it('is needs-review with only a draft', () => {
    expect(getTranslationStatus({ english: 'A', draft: 'Α' })).toBe(
      'needs-review',
    )
  })
  it('is outdated when the row hash does not match the English', () => {
    expect(
      getTranslationStatus({
        english: 'A changed',
        draft: 'Α',
        row: { sourceHash: hashSourceText('A') },
      }),
    ).toBe('outdated')
  })
  it('is done when the row hash matches', () => {
    expect(
      getTranslationStatus({
        english: 'A',
        row: { sourceHash: hashSourceText('A') },
      }),
    ).toBe('done')
  })
})

describe('listTranslations', () => {
  it('lists catalog keys with draft, saved value and status, filterable', async () => {
    const store = createStore([row({ sourceHash: 'stale' })])
    const all = await listTranslations(store, { locale: 'el' }, catalog)
    expect(all.map((i) => [i.key, i.status])).toEqual([
      ['hi', 'outdated'],
      ['bye', 'needs-review'],
      ['new', 'missing'],
    ])
    expect(all[0]).toMatchObject({
      english: 'Hello {{name}}',
      greekDraft: 'Γεια {{name}}',
      value: 'Χαίρε {{name}}',
    })
    const missing = await listTranslations(
      store,
      { locale: 'el', status: 'missing' },
      catalog,
    )
    expect(missing.map((i) => i.key)).toEqual(['new'])
  })
})

describe('upsertTranslation / resetTranslation', () => {
  it('stores the value with the hash of the current English', async () => {
    const saved = await upsertTranslation(
      createStore(),
      { locale: 'el', namespace: 'common', key: 'hi', value: 'Ω {{name}}' },
      'admin-1',
      catalog,
    )
    expect(saved.sourceHash).toBe(hashSourceText('Hello {{name}}'))
    expect(saved.updatedById).toBe('admin-1')
  })

  it('hashes Greek against the English override, so editing English outdates it and saving Greek clears it', async () => {
    const store = createStore()
    const hi = { namespace: 'common', key: 'hi' }
    await upsertTranslation(
      store,
      { locale: 'el', ...hi, value: 'Χαίρε {{name}}' },
      null,
      catalog,
    )
    const statusOf = async () =>
      (await listTranslations(store, { locale: 'el' }, catalog)).find(
        (i) => i.key === 'hi',
      )?.status
    expect(await statusOf()).toBe('done')

    await upsertTranslation(
      store,
      { locale: 'en', ...hi, value: 'Howdy {{name}}' },
      null,
      catalog,
    )
    expect(await statusOf()).toBe('outdated')

    await upsertTranslation(
      store,
      { locale: 'el', ...hi, value: 'Χαίρε {{name}}' },
      null,
      catalog,
    )
    expect(await statusOf()).toBe('done')
  })

  it('rejects unknown keys and dropped placeholders', async () => {
    const store = createStore()
    await expect(
      upsertTranslation(
        store,
        { locale: 'el', namespace: 'common', key: 'nope', value: 'x' },
        null,
        catalog,
      ),
    ).rejects.toBeInstanceOf(TranslationValidationError)
    await expect(
      upsertTranslation(
        store,
        { locale: 'el', namespace: 'common', key: 'hi', value: 'Γεια' },
        null,
        catalog,
      ),
    ).rejects.toThrow('{{name}}')
  })

  it('reset removes the row so the default applies again', async () => {
    const store = createStore([row({})])
    await resetTranslation(
      store,
      { locale: 'el', namespace: 'common', key: 'hi' },
      catalog,
    )
    const bundle = await getTranslationBundle(
      store,
      { locale: 'el', namespace: 'common' },
      catalog,
    )
    expect(bundle.hi).toBe('Γεια {{name}}')
  })
})

describe('placeholders', () => {
  it('extracts and compares placeholders', () => {
    expect(extractPlaceholders('{{a}} and {{ b }} {{a}}')).toEqual(['a', 'b'])
    expect(findMissingPlaceholders('{{a}} {{b}}', '{{a}}')).toEqual(['b'])
  })
})

describe('shipped catalog', () => {
  for (const namespace of TRANSLATION_NAMESPACES) {
    it(`Greek drafts for "${namespace}" use only English keys and keep placeholders`, () => {
      const english = translationCatalog[namespace]
      for (const [key, draft] of Object.entries(greekDrafts[namespace])) {
        expect(english, `${namespace}.${key} has no English`).toHaveProperty(
          key,
        )
        expect(
          findMissingPlaceholders(english[key]!, draft),
          `${namespace}.${key} drops a placeholder`,
        ).toEqual([])
      }
    })
  }
})
