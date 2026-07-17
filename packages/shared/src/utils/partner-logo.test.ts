import { describe, expect, it, vi } from 'vitest'
import type { PartnerLogoCategory } from '../types/partner-logo.ts'
import {
  comparePartnerLogosForList,
  createPartnerLogo,
  listPartnerLogos,
  PartnerLogoObjectKeyAlreadyAssignedError,
  type PartnerLogoRecord,
  type PartnerLogoStore,
} from './partner-logo.ts'

const now = new Date('2026-07-17T12:00:00.000Z')

function createStore(
  initialRecords: PartnerLogoRecord[] = [],
): PartnerLogoStore & { records: PartnerLogoRecord[] } {
  const records = [...initialRecords]

  return {
    records,
    findByObjectKey: vi.fn(
      async (objectKey: string) =>
        records.find((record) => record.objectKey === objectKey) ?? null,
    ),
    findMaxSortOrder: vi.fn(async (category: PartnerLogoCategory) => {
      const categoryRecords = records.filter(
        (record) => record.category === category,
      )
      if (categoryRecords.length === 0) {
        return null
      }

      return Math.max(...categoryRecords.map((record) => record.sortOrder))
    }),
    create: vi.fn(
      async (data: {
        id: string
        objectKey: string
        alt: string
        category: PartnerLogoCategory
        sortOrder: number
      }) => {
        const record: PartnerLogoRecord = {
          ...data,
          createdAt: now,
          updatedAt: now,
        }
        records.push(record)
        return record
      },
    ),
    listAll: vi.fn(async () => [...records]),
  }
}

describe('partner logo domain', () => {
  it('rejects duplicate objectKey assignments', async () => {
    const store = createStore([
      {
        id: 'logo-1',
        objectKey: 'marketing/logos/strategic/acme.png',
        alt: 'Acme',
        category: 'strategic',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
    ])

    await expect(
      createPartnerLogo(
        store,
        {
          generateId: () => 'logo-2',
        },
        {
          objectKey: 'marketing/logos/strategic/acme.png',
          alt: 'Duplicate',
          category: 'clinical',
        },
      ),
    ).rejects.toBeInstanceOf(PartnerLogoObjectKeyAlreadyAssignedError)
  })

  it('appends new logos to the end of their category sort order', async () => {
    const store = createStore([
      {
        id: 'logo-1',
        objectKey: 'marketing/logos/strategic/a.png',
        alt: 'A',
        category: 'strategic',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'logo-2',
        objectKey: 'marketing/logos/clinical/b.png',
        alt: 'B',
        category: 'clinical',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const created = await createPartnerLogo(
      store,
      { generateId: () => 'logo-3' },
      {
        objectKey: 'marketing/logos/strategic/c.png',
        alt: 'C',
        category: 'strategic',
      },
    )

    expect(created.sortOrder).toBe(1)
  })

  it('lists logos ordered by category then sortOrder with CDN URLs derived at read time', async () => {
    const store = createStore([
      {
        id: 'logo-1',
        objectKey: 'marketing/logos/clinical/second-clinical.png',
        alt: 'Clinical two',
        category: 'clinical',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'logo-2',
        objectKey: 'marketing/logos/strategic/second-strategic.png',
        alt: 'Strategic two',
        category: 'strategic',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'logo-3',
        objectKey: 'marketing/logos/clinical/first-clinical.png',
        alt: 'Clinical one',
        category: 'clinical',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'logo-4',
        objectKey: 'marketing/logos/strategic/first-strategic.png',
        alt: 'Strategic one',
        category: 'strategic',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
    ])

    const listed = await listPartnerLogos(store)

    expect(listed.map((item) => item.objectKey)).toEqual([
      'marketing/logos/strategic/first-strategic.png',
      'marketing/logos/strategic/second-strategic.png',
      'marketing/logos/clinical/first-clinical.png',
      'marketing/logos/clinical/second-clinical.png',
    ])
    expect(listed[0]?.cdnUrl).toMatch(
      /marketing\/logos\/strategic\/first-strategic\.png$/,
    )
  })

  it('orders strategic logos before clinical logos', () => {
    expect(
      comparePartnerLogosForList(
        {
          category: 'clinical',
          sortOrder: 0,
        },
        {
          category: 'strategic',
          sortOrder: 99,
        },
      ),
    ).toBeGreaterThan(0)
  })
})
