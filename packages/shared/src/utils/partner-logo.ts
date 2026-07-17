import type {
  CreatePartnerLogoInput,
  PartnerLogoCategory,
  PartnerLogoListItem,
} from '../types/partner-logo.ts'
import { bucketCdnUrl, validateBucketObjectKey } from './bucket.ts'

export type PartnerLogoRecord = {
  id: string
  objectKey: string
  alt: string
  category: PartnerLogoCategory
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type PartnerLogoStore = {
  findByObjectKey: (objectKey: string) => Promise<PartnerLogoRecord | null>
  findMaxSortOrder: (category: PartnerLogoCategory) => Promise<number | null>
  create: (data: {
    id: string
    objectKey: string
    alt: string
    category: PartnerLogoCategory
    sortOrder: number
  }) => Promise<PartnerLogoRecord>
  listAll: () => Promise<PartnerLogoRecord[]>
}

export class PartnerLogoObjectKeyAlreadyAssignedError extends Error {
  constructor(objectKey: string) {
    super(`Object key "${objectKey}" is already assigned to a partner logo.`)
    this.name = 'PartnerLogoObjectKeyAlreadyAssignedError'
  }
}

export class PartnerLogoValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PartnerLogoValidationError'
  }
}

const CATEGORY_ORDER: Record<PartnerLogoCategory, number> = {
  strategic: 0,
  clinical: 1,
}

export function comparePartnerLogosForList(
  left: Pick<PartnerLogoRecord, 'category' | 'sortOrder'>,
  right: Pick<PartnerLogoRecord, 'category' | 'sortOrder'>,
): number {
  const categoryCompare =
    CATEGORY_ORDER[left.category] - CATEGORY_ORDER[right.category]

  if (categoryCompare !== 0) {
    return categoryCompare
  }

  return left.sortOrder - right.sortOrder
}

export function mapPartnerLogoToListItem(
  record: PartnerLogoRecord,
): PartnerLogoListItem {
  return {
    id: record.id,
    objectKey: record.objectKey,
    alt: record.alt,
    category: record.category,
    sortOrder: record.sortOrder,
    cdnUrl: bucketCdnUrl(record.objectKey),
  }
}

export async function listPartnerLogos(
  store: PartnerLogoStore,
): Promise<PartnerLogoListItem[]> {
  const records = await store.listAll()

  return [...records]
    .sort(comparePartnerLogosForList)
    .map(mapPartnerLogoToListItem)
}

function normalizePartnerLogoInput(input: CreatePartnerLogoInput) {
  const objectKey = input.objectKey.trim()
  const alt = input.alt.trim()
  const objectKeyError = validateBucketObjectKey(objectKey)

  if (objectKeyError) {
    throw new PartnerLogoValidationError(objectKeyError)
  }

  if (!alt) {
    throw new PartnerLogoValidationError('Alt text cannot be empty.')
  }

  return {
    objectKey,
    alt,
    category: input.category,
  }
}

export async function createPartnerLogo(
  store: PartnerLogoStore,
  deps: { generateId: () => string },
  input: CreatePartnerLogoInput,
): Promise<PartnerLogoListItem> {
  const normalized = normalizePartnerLogoInput(input)
  const existing = await store.findByObjectKey(normalized.objectKey)

  if (existing) {
    throw new PartnerLogoObjectKeyAlreadyAssignedError(normalized.objectKey)
  }

  const maxSortOrder = await store.findMaxSortOrder(normalized.category)
  const sortOrder = (maxSortOrder ?? -1) + 1

  const created = await store.create({
    id: deps.generateId(),
    ...normalized,
    sortOrder,
  })

  return mapPartnerLogoToListItem(created)
}
