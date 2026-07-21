import { describe, expect, it, vi } from 'vitest'
import type { HighlightCardCollection } from '../types/highlight-card.ts'
import { isRenderableLucideIcon } from './lucide-icon.ts'
import {
  createHighlightCard,
  HighlightCardCollectionFullError,
  HighlightCardNotFoundError,
  HighlightCardValidationError,
  listHighlightCards,
  removeHighlightCard,
  reorderHighlightCard,
  updateHighlightCard,
  type HighlightCardRecord,
  type HighlightCardStore,
  type HighlightCardUpdateData,
} from './highlight-card.ts'

const now = new Date('2026-07-21T12:00:00.000Z')
const REACT_FORWARD_REF = Symbol.for('react.forward_ref')

function mockLucideIcon() {
  return {
    $$typeof: REACT_FORWARD_REF,
    render: () => null,
  }
}

const lucideModule = {
  icons: { Activity: mockLucideIcon() },
  Activity: mockLucideIcon(),
  Shield: mockLucideIcon(),
  createLucideIcon: () => mockLucideIcon(),
  Icon: mockLucideIcon(),
}

function createStore(
  initialRecords: HighlightCardRecord[] = [],
): HighlightCardStore & { records: HighlightCardRecord[] } {
  const records = [...initialRecords]

  return {
    records,
    findById: vi.fn(
      async (id: string) => records.find((record) => record.id === id) ?? null,
    ),
    findMaxSortOrder: vi.fn(async (collection: HighlightCardCollection) => {
      const collectionRecords = records.filter(
        (record) => record.collection === collection,
      )
      if (collectionRecords.length === 0) {
        return null
      }

      return Math.max(...collectionRecords.map((record) => record.sortOrder))
    }),
    deleteById: vi.fn(async (id: string) => {
      const index = records.findIndex((record) => record.id === id)
      if (index === -1) {
        return
      }

      records.splice(index, 1)
    }),
    create: vi.fn(
      async (data: {
        id: string
        collection: HighlightCardCollection
        title: string
        body: string
        iconName: string
        sortOrder: number
      }) => {
        const record: HighlightCardRecord = {
          ...data,
          createdAt: now,
          updatedAt: now,
        }
        records.push(record)
        return record
      },
    ),
    update: vi.fn(async (id: string, data: HighlightCardUpdateData) => {
      const record = records.find((entry) => entry.id === id)
      if (!record) {
        throw new Error(`Record ${id} not found`)
      }

      Object.assign(record, data, { updatedAt: now })
      return record
    }),
    listAll: vi.fn(async () => [...records]),
    listByCollection: vi.fn(async (collection: HighlightCardCollection) =>
      records.filter((record) => record.collection === collection),
    ),
  }
}

function card(
  overrides: Partial<HighlightCardRecord> &
    Pick<HighlightCardRecord, 'id' | 'collection' | 'sortOrder'>,
): HighlightCardRecord {
  return {
    title: 'Card title',
    body: 'Card body',
    iconName: 'Activity',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

describe('highlight card domain', () => {
  it('rejects empty title after trim', async () => {
    const store = createStore()

    await expect(
      createHighlightCard(
        store,
        { generateId: () => 'card-1', lucideModule },
        {
          collection: 'benefits',
          title: '   ',
          body: 'Body',
          iconName: 'Activity',
        },
      ),
    ).rejects.toBeInstanceOf(HighlightCardValidationError)
  })

  it('rejects titles longer than 80 characters', async () => {
    const store = createStore()

    await expect(
      createHighlightCard(
        store,
        { generateId: () => 'card-1', lucideModule },
        {
          collection: 'benefits',
          title: 'a'.repeat(81),
          body: 'Body',
          iconName: 'Activity',
        },
      ),
    ).rejects.toBeInstanceOf(HighlightCardValidationError)
  })

  it('rejects bodies longer than 280 characters', async () => {
    const store = createStore()

    await expect(
      createHighlightCard(
        store,
        { generateId: () => 'card-1', lucideModule },
        {
          collection: 'benefits',
          title: 'Title',
          body: 'a'.repeat(281),
          iconName: 'Activity',
        },
      ),
    ).rejects.toBeInstanceOf(HighlightCardValidationError)
  })

  it('rejects icon names that do not resolve to renderable Lucide icons', async () => {
    const store = createStore()

    await expect(
      createHighlightCard(
        store,
        { generateId: () => 'card-1', lucideModule },
        {
          collection: 'benefits',
          title: 'Title',
          body: 'Body',
          iconName: 'NotARealIcon',
        },
      ),
    ).rejects.toBeInstanceOf(HighlightCardValidationError)

    await expect(
      createHighlightCard(
        store,
        { generateId: () => 'card-2', lucideModule },
        {
          collection: 'benefits',
          title: 'Title',
          body: 'Body',
          iconName: 'createLucideIcon',
        },
      ),
    ).rejects.toBeInstanceOf(HighlightCardValidationError)
  })

  it('rejects create when a collection already has six cards', async () => {
    const store = createStore(
      Array.from({ length: 6 }, (_, index) =>
        card({
          id: `card-${index + 1}`,
          collection: 'benefits',
          sortOrder: index,
        }),
      ),
    )

    await expect(
      createHighlightCard(
        store,
        { generateId: () => 'card-7', lucideModule },
        {
          collection: 'benefits',
          title: 'Seventh card',
          body: 'Should not be allowed',
          iconName: 'Activity',
        },
      ),
    ).rejects.toBeInstanceOf(HighlightCardCollectionFullError)
  })

  it('appends new cards to the end of their collection sort order', async () => {
    const store = createStore([
      card({
        id: 'card-1',
        collection: 'benefits',
        sortOrder: 0,
      }),
      card({
        id: 'card-2',
        collection: 'features',
        sortOrder: 0,
      }),
    ])

    const created = await createHighlightCard(
      store,
      { generateId: () => 'card-3', lucideModule },
      {
        collection: 'benefits',
        title: 'New benefit',
        body: 'Benefit body',
        iconName: 'Shield',
      },
    )

    expect(created.sortOrder).toBe(1)
    expect(created).not.toHaveProperty('cdnUrl')
  })

  it('lists cards ordered by sortOrder for a collection', async () => {
    const store = createStore([
      card({
        id: 'card-2',
        collection: 'benefits',
        sortOrder: 1,
        title: 'Second',
      }),
      card({
        id: 'card-1',
        collection: 'benefits',
        sortOrder: 0,
        title: 'First',
      }),
      card({
        id: 'card-3',
        collection: 'features',
        sortOrder: 0,
        title: 'Feature',
      }),
    ])

    const listed = await listHighlightCards(store, 'benefits')

    expect(listed.map((item) => item.title)).toEqual(['First', 'Second'])
    expect(listed.every((item) => !('cdnUrl' in item))).toBe(true)
  })

  it('updates title, body, and iconName on an existing card', async () => {
    const store = createStore([
      card({
        id: 'card-1',
        collection: 'benefits',
        sortOrder: 0,
      }),
    ])

    const updated = await updateHighlightCard(
      store,
      { lucideModule },
      {
        id: 'card-1',
        title: 'Updated title',
        body: 'Updated body',
        iconName: 'Shield',
      },
    )

    expect(updated).toMatchObject({
      title: 'Updated title',
      body: 'Updated body',
      iconName: 'Shield',
      sortOrder: 0,
    })
  })

  it('swaps sort order when reordering within a collection', async () => {
    const store = createStore([
      card({
        id: 'card-1',
        collection: 'benefits',
        sortOrder: 0,
      }),
      card({
        id: 'card-2',
        collection: 'benefits',
        sortOrder: 1,
      }),
      card({
        id: 'card-3',
        collection: 'benefits',
        sortOrder: 2,
      }),
    ])

    const reordered = await reorderHighlightCard(store, {
      id: 'card-2',
      direction: 'down',
    })

    expect(reordered.map((item) => item.id)).toEqual([
      'card-1',
      'card-3',
      'card-2',
    ])
  })

  it('removes a card by id', async () => {
    const store = createStore([
      card({
        id: 'card-1',
        collection: 'benefits',
        sortOrder: 0,
      }),
    ])

    const outcome = await removeHighlightCard(store, { id: 'card-1' })

    expect(outcome).toEqual({ id: 'card-1' })
    expect(store.records).toHaveLength(0)
    await expect(listHighlightCards(store, 'benefits')).resolves.toEqual([])
  })

  it('rejects remove when the highlight card does not exist', async () => {
    const store = createStore()

    await expect(
      removeHighlightCard(store, { id: 'missing-card' }),
    ).rejects.toBeInstanceOf(HighlightCardNotFoundError)
  })
})

describe('highlight card lucide integration', () => {
  it('accepts seed icon names from the website Lucide version when available', async () => {
    let websiteLucide: Record<string, unknown> | null = null

    try {
      websiteLucide = await import('lucide-react')
    } catch {
      return
    }

    const seedIconNames = [
      'PersonStanding',
      'Shield',
      'Users',
      'Sparkles',
      'ClipboardList',
      'Building2',
      'Activity',
      'Brain',
      'Package',
      'BarChartBig',
      'Sliders',
      'Clock',
    ]

    for (const iconName of seedIconNames) {
      expect(isRenderableLucideIcon(iconName, websiteLucide)).toBe(true)
    }
  })
})
