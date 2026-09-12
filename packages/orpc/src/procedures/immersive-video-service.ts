import type { PrismaClient } from '@virtality/db'
import { createHash } from 'node:crypto'
import type { Readable } from 'node:stream'
import { bucketCdnUrl, generateUUID } from '@virtality/shared/utils'
import {
  expectedImmersiveVideoPartSize,
  immersiveVideoFileExtension,
  immersiveVideoPartCount,
  ImmersiveVideoError,
  ImmersiveVideoNotFoundError,
  isAllowedImmersiveVideoExtension,
  isImmersiveVideoDiscardEmpty,
  toSizeBytesNumber,
  type ImmersiveVideoActivity,
  type ImmersiveVideoAdminRow,
  type ImmersiveVideoCatalogState,
  type ImmersiveVideoRecord,
} from './immersive-video-constants.ts'
import type { ImmersiveVideoS3 } from './immersive-video-s3.ts'

export type ImmersiveVideoPrisma = PrismaClient

type ServiceDeps = {
  prisma: ImmersiveVideoPrisma
  s3: ImmersiveVideoS3
}

const UPLOADABLE_STATES: ImmersiveVideoCatalogState[] = [
  'Draft',
  'Unpublished',
  'Published',
]

const PUBLISHABLE_STATES: ImmersiveVideoCatalogState[] = [
  'Draft',
  'Unpublished',
]

function asRecord(row: ImmersiveVideoRecord | null, id: string) {
  if (!row) {
    throw new ImmersiveVideoNotFoundError(id)
  }
  return row
}

async function loadVideo(
  prisma: ImmersiveVideoPrisma,
  id: string,
): Promise<ImmersiveVideoRecord> {
  const row = await prisma.immersiveVideo.findUnique({ where: { id } })
  return asRecord(row, id)
}

export function toImmersiveVideoAdminRow(
  row: ImmersiveVideoRecord,
  uploadProgress?: { uploadedParts: number; partCount: number },
): ImmersiveVideoAdminRow {
  return {
    id: row.id,
    title: row.title,
    activity: row.activity,
    description: row.description,
    state: row.state,
    version: row.version,
    sizeBytes: toSizeBytesNumber(row.sizeBytes),
    durationSec: row.durationSec,
    thumbnailUrl: row.thumbnailKey ? bucketCdnUrl(row.thumbnailKey) : null,
    filename: row.filename ?? row.uploadFilename,
    ...(uploadProgress ? { uploadProgress } : {}),
    verifyFailedAt: row.verifyFailedAt,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

async function withUploadProgress(
  s3: ImmersiveVideoS3,
  row: ImmersiveVideoRecord,
): Promise<ImmersiveVideoAdminRow> {
  const uploadSize = toSizeBytesNumber(row.uploadSizeBytes)
  if (
    !row.uploadId ||
    !row.uploadObjectKey ||
    uploadSize == null ||
    (row.state !== 'Uploading' && row.state !== 'Republishing')
  ) {
    return toImmersiveVideoAdminRow(row)
  }

  const parts = await s3.listParts({
    key: row.uploadObjectKey,
    uploadId: row.uploadId,
  })
  return toImmersiveVideoAdminRow(row, {
    uploadedParts: parts.length,
    partCount: immersiveVideoPartCount(uploadSize),
  })
}

const UPLOAD_CLEAR = {
  uploadId: null,
  uploadObjectKey: null,
  uploadFilename: null,
  uploadSizeBytes: null,
  uploadDurationSec: null,
}

export async function listImmersiveVideoCatalog(
  deps: ServiceDeps,
): Promise<ImmersiveVideoAdminRow[]> {
  const rows = await deps.prisma.immersiveVideo.findMany({
    orderBy: { updatedAt: 'desc' },
  })
  return Promise.all(rows.map((row) => withUploadProgress(deps.s3, row)))
}

export async function getImmersiveVideo(
  deps: ServiceDeps,
  id: string,
): Promise<ImmersiveVideoAdminRow> {
  const row = await loadVideo(deps.prisma, id)
  return withUploadProgress(deps.s3, row)
}

export async function createImmersiveVideo(
  deps: ServiceDeps,
): Promise<{ id: string }> {
  const row = await deps.prisma.immersiveVideo.create({
    data: {
      title: '',
      activity: 'CYCLING',
      state: 'Draft',
    },
  })
  return { id: row.id }
}

export async function updateImmersiveVideo(
  deps: ServiceDeps,
  input: {
    id: string
    title?: string
    activity?: ImmersiveVideoActivity
    description?: string | null
  },
): Promise<ImmersiveVideoAdminRow> {
  const row = await loadVideo(deps.prisma, input.id)

  if (input.title !== undefined) {
    if (input.title.length > 120) {
      throw new ImmersiveVideoError('TITLE_TOO_LONG')
    }
    if (input.title.length === 0 && row.state !== 'Draft') {
      throw new ImmersiveVideoError('TITLE_REQUIRED')
    }
  }

  if (input.description !== undefined && input.description != null) {
    if (input.description.length > 500) {
      throw new ImmersiveVideoError('DESCRIPTION_TOO_LONG')
    }
  }

  const updated = await deps.prisma.immersiveVideo.update({
    where: { id: input.id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.activity !== undefined ? { activity: input.activity } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
    },
  })
  return withUploadProgress(deps.s3, updated)
}

export async function setImmersiveVideoThumbnail(
  deps: ServiceDeps,
  input: { id: string; file: File },
): Promise<{ thumbnailKey: string; thumbnailUrl: string }> {
  const row = await loadVideo(deps.prisma, input.id)
  const thumbnailKey = `immersive-videos/${row.id}/thumbnail-${generateUUID()}.jpg`
  const body = Buffer.from(await input.file.arrayBuffer())
  await deps.s3.putObject({
    key: thumbnailKey,
    body,
    contentType: input.file.type || 'image/jpeg',
  })
  await deps.prisma.immersiveVideo.update({
    where: { id: row.id },
    data: { thumbnailKey },
  })
  if (row.thumbnailKey) {
    await deps.s3.deleteObject({ key: row.thumbnailKey })
  }
  return { thumbnailKey, thumbnailUrl: bucketCdnUrl(thumbnailKey) }
}

export async function discardImmersiveVideoIfEmpty(
  deps: ServiceDeps,
  id: string,
): Promise<{ deleted: boolean }> {
  const row = await loadVideo(deps.prisma, id)
  if (!isImmersiveVideoDiscardEmpty(row)) {
    return { deleted: false }
  }
  await deps.prisma.immersiveVideo.delete({ where: { id } })
  return { deleted: true }
}

export async function publishImmersiveVideo(
  deps: ServiceDeps,
  id: string,
): Promise<ImmersiveVideoAdminRow> {
  const row = await loadVideo(deps.prisma, id)
  if (!PUBLISHABLE_STATES.includes(row.state)) {
    throw new ImmersiveVideoError('NOT_PUBLISHABLE')
  }
  if (!row.objectKey || !row.checksum || !row.thumbnailKey) {
    throw new ImmersiveVideoError('PUBLISH_PRECONDITIONS')
  }
  const updated = await deps.prisma.immersiveVideo.update({
    where: { id },
    data: {
      state: 'Published',
      publishedAt: row.publishedAt ?? new Date(),
    },
  })
  return toImmersiveVideoAdminRow(updated)
}

export async function unpublishImmersiveVideo(
  deps: ServiceDeps,
  id: string,
): Promise<ImmersiveVideoAdminRow> {
  const row = await loadVideo(deps.prisma, id)
  if (row.state !== 'Published') {
    throw new ImmersiveVideoError('NOT_PUBLISHED')
  }
  const updated = await deps.prisma.immersiveVideo.update({
    where: { id },
    data: { state: 'Unpublished' },
  })
  return toImmersiveVideoAdminRow(updated)
}

export async function deleteImmersiveVideo(
  deps: ServiceDeps,
  id: string,
): Promise<void> {
  const row = await loadVideo(deps.prisma, id)
  const retired = await deps.prisma.immersiveVideoRetiredObject.findMany({
    where: { videoId: id },
    select: { objectKey: true },
  })

  if (row.uploadId && row.uploadObjectKey) {
    await deps.s3.abortMultipartUpload({
      key: row.uploadObjectKey,
      uploadId: row.uploadId,
    })
  }

  const keys = new Set<string>()
  if (row.objectKey) keys.add(row.objectKey)
  if (row.uploadObjectKey) keys.add(row.uploadObjectKey)
  if (row.thumbnailKey) keys.add(row.thumbnailKey)
  for (const item of retired) {
    keys.add(item.objectKey)
  }

  for (const key of keys) {
    await deps.s3.deleteObject({ key })
  }

  await deps.prisma.deviceVideo.deleteMany({ where: { videoId: id } })
  await deps.prisma.immersiveVideo.delete({ where: { id } })
}

export async function startImmersiveVideoUpload(
  deps: ServiceDeps,
  input: {
    id: string
    filename: string
    sizeBytes: number
    contentType: string
    durationSec?: number | null
  },
): Promise<{ uploadId: string; partSizeBytes: number; partCount: number }> {
  const row = await loadVideo(deps.prisma, input.id)
  if (row.uploadId) {
    throw new ImmersiveVideoError('UPLOAD_IN_PROGRESS')
  }
  if (!UPLOADABLE_STATES.includes(row.state)) {
    throw new ImmersiveVideoError('UPLOAD_NOT_ALLOWED')
  }
  if (!input.contentType.startsWith('video/')) {
    throw new ImmersiveVideoError('INVALID_CONTENT_TYPE')
  }
  const extension = immersiveVideoFileExtension(input.filename)
  if (!isAllowedImmersiveVideoExtension(extension)) {
    throw new ImmersiveVideoError('INVALID_FILENAME')
  }

  const nextVersion = row.version + 1
  const uploadObjectKey = `immersive-videos/${row.id}/v${nextVersion}.${extension}`
  const { uploadId } = await deps.s3.createMultipartUpload({
    key: uploadObjectKey,
    contentType: input.contentType,
  })

  const nextState: ImmersiveVideoCatalogState =
    row.state === 'Published' ? 'Republishing' : 'Uploading'

  await deps.prisma.immersiveVideo.update({
    where: { id: row.id },
    data: {
      priorState: row.state,
      state: nextState,
      verifyFailedAt: null,
      uploadId,
      uploadObjectKey,
      uploadFilename: input.filename,
      uploadSizeBytes: BigInt(input.sizeBytes),
      uploadDurationSec: input.durationSec ?? null,
    },
  })

  return {
    uploadId,
    partSizeBytes: 67_108_864,
    partCount: immersiveVideoPartCount(input.sizeBytes),
  }
}

export async function uploadImmersiveVideoPart(
  deps: ServiceDeps,
  input: { id: string; partNumber: number; part: File },
): Promise<{ partNumber: number }> {
  const row = await loadVideo(deps.prisma, input.id)
  if (!row.uploadId || !row.uploadObjectKey) {
    throw new ImmersiveVideoError('NO_UPLOAD')
  }
  const sizeBytes = toSizeBytesNumber(row.uploadSizeBytes) ?? 0
  const partCount = immersiveVideoPartCount(sizeBytes)
  if (input.partNumber < 1 || input.partNumber > partCount) {
    throw new ImmersiveVideoError('BAD_PART_NUMBER')
  }
  const expectedSize = expectedImmersiveVideoPartSize(
    sizeBytes,
    input.partNumber,
  )
  if (input.part.size !== expectedSize) {
    throw new ImmersiveVideoError('BAD_PART_SIZE')
  }

  const body = Buffer.from(await input.part.arrayBuffer())
  await deps.s3.uploadPart({
    key: row.uploadObjectKey,
    uploadId: row.uploadId,
    partNumber: input.partNumber,
    body,
    contentLength: input.part.size,
  })
  return { partNumber: input.partNumber }
}

export async function immersiveVideoUploadStatus(
  deps: ServiceDeps,
  id: string,
): Promise<{
  uploadedPartNumbers: number[]
  sizeBytes: number
  filename: string
}> {
  const row = await loadVideo(deps.prisma, id)
  if (!row.uploadId || !row.uploadObjectKey) {
    throw new ImmersiveVideoError('NO_UPLOAD')
  }
  const parts = await deps.s3.listParts({
    key: row.uploadObjectKey,
    uploadId: row.uploadId,
  })
  return {
    uploadedPartNumbers: parts
      .map((part) => part.partNumber)
      .sort((a, b) => a - b),
    sizeBytes: toSizeBytesNumber(row.uploadSizeBytes) ?? 0,
    filename: row.uploadFilename ?? '',
  }
}

export async function completeImmersiveVideoUpload(
  deps: ServiceDeps,
  id: string,
  runVerify: (id: string) => void,
): Promise<ImmersiveVideoAdminRow> {
  const row = await loadVideo(deps.prisma, id)
  if (!row.uploadId || !row.uploadObjectKey) {
    throw new ImmersiveVideoError('NO_UPLOAD')
  }
  const sizeBytes = toSizeBytesNumber(row.uploadSizeBytes) ?? 0
  const partCount = immersiveVideoPartCount(sizeBytes)
  const parts = await deps.s3.listParts({
    key: row.uploadObjectKey,
    uploadId: row.uploadId,
  })
  const present = new Set(parts.map((part) => part.partNumber))
  for (let partNumber = 1; partNumber <= partCount; partNumber += 1) {
    if (!present.has(partNumber)) {
      throw new ImmersiveVideoError('PARTS_MISSING')
    }
  }

  await deps.s3.completeMultipartUpload({
    key: row.uploadObjectKey,
    uploadId: row.uploadId,
    parts,
  })

  const updated = await deps.prisma.immersiveVideo.update({
    where: { id },
    data: { state: 'Verifying' },
  })
  void runVerify(id)
  return toImmersiveVideoAdminRow(updated)
}

export async function abortImmersiveVideoUpload(
  deps: ServiceDeps,
  id: string,
): Promise<ImmersiveVideoAdminRow> {
  const row = await loadVideo(deps.prisma, id)
  if (!row.uploadId || !row.uploadObjectKey) {
    throw new ImmersiveVideoError('NO_UPLOAD')
  }
  await deps.s3.abortMultipartUpload({
    key: row.uploadObjectKey,
    uploadId: row.uploadId,
  })
  const priorState = row.priorState ?? 'Draft'
  const updated = await deps.prisma.immersiveVideo.update({
    where: { id },
    data: {
      state: priorState,
      priorState: null,
      ...UPLOAD_CLEAR,
    },
  })
  return toImmersiveVideoAdminRow(updated)
}

async function hashReadable(stream: Readable): Promise<{
  hex: string
  bytes: number
}> {
  const hash = createHash('sha256')
  let bytes = 0
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += buffer.length
    hash.update(buffer)
  }
  return { hex: hash.digest('hex'), bytes }
}

export async function runImmersiveVideoVerify(
  id: string,
  deps: ServiceDeps,
): Promise<ImmersiveVideoAdminRow | null> {
  const row = await loadVideo(deps.prisma, id)
  if (row.state !== 'Verifying' || !row.uploadObjectKey) {
    return toImmersiveVideoAdminRow(row)
  }

  const expectedBytes = toSizeBytesNumber(row.uploadSizeBytes)
  const priorState = row.priorState
  const restoreState: ImmersiveVideoCatalogState =
    priorState === 'Published' ? 'Published' : 'Draft'

  let hex: string | null = null
  let bytes = 0
  let readFailed = false
  try {
    const stream = await deps.s3.getObjectStream({ key: row.uploadObjectKey })
    const hashed = await hashReadable(stream)
    hex = hashed.hex
    bytes = hashed.bytes
  } catch {
    readFailed = true
  }

  const verified =
    !readFailed && expectedBytes != null && bytes === expectedBytes

  if (!verified) {
    await deps.s3.deleteObject({ key: row.uploadObjectKey })
    const updated = await deps.prisma.immersiveVideo.update({
      where: { id },
      data: {
        state: restoreState,
        priorState: null,
        verifyFailedAt: new Date(),
        ...UPLOAD_CLEAR,
      },
    })
    return toImmersiveVideoAdminRow(updated)
  }

  const updated = await deps.prisma.$transaction(async (tx) => {
    if (row.objectKey) {
      await tx.immersiveVideoRetiredObject.create({
        data: {
          videoId: row.id,
          version: row.version,
          objectKey: row.objectKey,
        },
      })
    }
    return tx.immersiveVideo.update({
      where: { id },
      data: {
        objectKey: row.uploadObjectKey,
        sizeBytes: row.uploadSizeBytes,
        checksum: hex,
        filename: row.uploadFilename,
        durationSec: row.uploadDurationSec,
        version: row.version + 1,
        state: restoreState,
        priorState: null,
        ...UPLOAD_CLEAR,
      },
    })
  })

  return toImmersiveVideoAdminRow(updated)
}

export async function sweepImmersiveVideoVerify(
  deps: ServiceDeps,
): Promise<void> {
  const rows = await deps.prisma.immersiveVideo.findMany({
    where: { state: 'Verifying' },
    select: { id: true },
  })
  for (const row of rows) {
    await runImmersiveVideoVerify(row.id, deps)
  }
}
