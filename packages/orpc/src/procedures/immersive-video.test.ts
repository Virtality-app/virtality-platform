import { Readable } from 'node:stream'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IMMERSIVE_VIDEO_PART_SIZE_BYTES } from './immersive-video-constants.ts'
import type { ImmersiveVideoRecord } from './immersive-video-constants.ts'
import type { ImmersiveVideoS3 } from './immersive-video-s3.ts'
import {
  abortImmersiveVideoUpload,
  deleteImmersiveVideo,
  discardImmersiveVideoIfEmpty,
  publishImmersiveVideo,
  startImmersiveVideoUpload,
  uploadImmersiveVideoPart,
  type ImmersiveVideoPrisma,
} from './immersive-video-service.ts'

const NOW = new Date('2026-09-12T12:00:00.000Z')

function baseRow(
  overrides: Partial<ImmersiveVideoRecord> = {},
): ImmersiveVideoRecord {
  return {
    id: 'video-1',
    title: '',
    activity: 'CYCLING',
    description: null,
    state: 'Draft',
    priorState: null,
    version: 0,
    objectKey: null,
    sizeBytes: null,
    checksum: null,
    durationSec: null,
    filename: null,
    thumbnailKey: null,
    uploadId: null,
    uploadObjectKey: null,
    uploadFilename: null,
    uploadSizeBytes: null,
    uploadDurationSec: null,
    verifyFailedAt: null,
    publishedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

function createPrisma(initial: ImmersiveVideoRecord) {
  const state = {
    row: { ...initial },
    deletedDeviceVideoWhere: null as unknown,
    deleted: false,
  }

  const prisma = {
    immersiveVideo: {
      findUnique: vi.fn(async () => (state.deleted ? null : state.row)),
      findMany: vi.fn(async () => (state.deleted ? [] : [state.row])),
      create: vi.fn(),
      update: vi.fn(
        async ({ data }: { data: Partial<ImmersiveVideoRecord> }) => {
          state.row = { ...state.row, ...data, updatedAt: NOW }
          return state.row
        },
      ),
      delete: vi.fn(async () => {
        state.deleted = true
        return state.row
      }),
    },
    immersiveVideoRetiredObject: {
      create: vi.fn(),
      findMany: vi.fn(async () => []),
    },
    deviceVideo: {
      deleteMany: vi.fn(async (args: unknown) => {
        state.deletedDeviceVideoWhere = args
      }),
    },
    $transaction: vi.fn(
      async (callback: (tx: ImmersiveVideoPrisma) => Promise<unknown>) =>
        callback(prisma as unknown as ImmersiveVideoPrisma),
    ),
  }

  return { prisma: prisma as unknown as ImmersiveVideoPrisma, state }
}

function createS3(overrides: Partial<ImmersiveVideoS3> = {}): ImmersiveVideoS3 {
  return {
    createMultipartUpload: vi.fn(async () => ({ uploadId: 'upload-1' })),
    uploadPart: vi.fn(async () => undefined),
    listParts: vi.fn(async () => []),
    completeMultipartUpload: vi.fn(async () => undefined),
    abortMultipartUpload: vi.fn(async () => undefined),
    putObject: vi.fn(async () => undefined),
    deleteObject: vi.fn(async () => undefined),
    getObjectStream: vi.fn(async () => Readable.from([])),
    ...overrides,
  }
}

describe('immersive video catalog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects publish without file, checksum, or thumbnail', async () => {
    const { prisma } = createPrisma(baseRow({ state: 'Draft' }))
    const s3 = createS3()

    await expect(
      publishImmersiveVideo({ prisma, s3 }, 'video-1'),
    ).rejects.toThrow('PUBLISH_PRECONDITIONS')
  })

  it('rejects publish from Uploading', async () => {
    const { prisma } = createPrisma(
      baseRow({
        state: 'Uploading',
        objectKey: 'immersive-videos/video-1/v1.mp4',
        checksum: 'abc',
        thumbnailKey: 'immersive-videos/video-1/thumbnail-1.jpg',
      }),
    )

    await expect(
      publishImmersiveVideo({ prisma, s3: createS3() }, 'video-1'),
    ).rejects.toThrow('NOT_PUBLISHABLE')
  })

  it('sets publishedAt only on the first publish', async () => {
    const firstPublishedAt = new Date('2026-01-01T00:00:00.000Z')
    const { prisma, state } = createPrisma(
      baseRow({
        title: 'Trail',
        state: 'Draft',
        objectKey: 'immersive-videos/video-1/v1.mp4',
        checksum: 'abc',
        thumbnailKey: 'immersive-videos/video-1/thumbnail-1.jpg',
      }),
    )
    const s3 = createS3()

    const first = await publishImmersiveVideo({ prisma, s3 }, 'video-1')
    expect(first.publishedAt).toBeInstanceOf(Date)

    state.row = {
      ...state.row,
      state: 'Unpublished',
      publishedAt: firstPublishedAt,
    }
    const second = await publishImmersiveVideo({ prisma, s3 }, 'video-1')
    expect(second.publishedAt).toEqual(firstPublishedAt)
  })

  it('discardIfEmpty deletes an empty row', async () => {
    const { prisma, state } = createPrisma(baseRow())
    const result = await discardImmersiveVideoIfEmpty(
      { prisma, s3: createS3() },
      'video-1',
    )
    expect(result).toEqual({ deleted: true })
    expect(state.deleted).toBe(true)
  })

  it('discardIfEmpty deletes a row whose only change is activity WALKING', async () => {
    const { prisma, state } = createPrisma(baseRow({ activity: 'WALKING' }))
    const result = await discardImmersiveVideoIfEmpty(
      { prisma, s3: createS3() },
      'video-1',
    )
    expect(result).toEqual({ deleted: true })
    expect(state.deleted).toBe(true)
  })

  it('discardIfEmpty keeps a row with only a description', async () => {
    const { prisma, state } = createPrisma(
      baseRow({ description: 'Coastal loop' }),
    )
    const result = await discardImmersiveVideoIfEmpty(
      { prisma, s3: createS3() },
      'video-1',
    )
    expect(result).toEqual({ deleted: false })
    expect(state.deleted).toBe(false)
  })

  it('upload.start from Published enters Republishing at v{version+1}', async () => {
    const { prisma, state } = createPrisma(
      baseRow({
        title: 'Trail',
        state: 'Published',
        version: 1,
        objectKey: 'immersive-videos/video-1/v1.mp4',
        checksum: 'abc',
        filename: 'trail.mp4',
      }),
    )
    const s3 = createS3()

    const result = await startImmersiveVideoUpload(
      { prisma, s3 },
      {
        id: 'video-1',
        filename: 'trail-v2.mp4',
        sizeBytes: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
        contentType: 'video/mp4',
      },
    )

    expect(result).toMatchObject({
      uploadId: 'upload-1',
      partSizeBytes: IMMERSIVE_VIDEO_PART_SIZE_BYTES,
      partCount: 1,
    })
    expect(state.row.state).toBe('Republishing')
    expect(state.row.priorState).toBe('Published')
    expect(state.row.uploadObjectKey).toBe('immersive-videos/video-1/v2.mp4')
  })

  it('upload.start while uploadId is set is rejected', async () => {
    const { prisma } = createPrisma(
      baseRow({
        state: 'Uploading',
        uploadId: 'open-upload',
        uploadObjectKey: 'immersive-videos/video-1/v1.mp4',
      }),
    )

    await expect(
      startImmersiveVideoUpload(
        { prisma, s3: createS3() },
        {
          id: 'video-1',
          filename: 'trail.mp4',
          sizeBytes: 10,
          contentType: 'video/mp4',
        },
      ),
    ).rejects.toThrow('UPLOAD_IN_PROGRESS')
  })

  it('upload.part rejects the wrong part size', async () => {
    const { prisma } = createPrisma(
      baseRow({
        state: 'Uploading',
        uploadId: 'upload-1',
        uploadObjectKey: 'immersive-videos/video-1/v1.mp4',
        uploadSizeBytes: BigInt(IMMERSIVE_VIDEO_PART_SIZE_BYTES),
        uploadFilename: 'trail.mp4',
      }),
    )
    const part = new File([new Uint8Array(1)], 'part.bin')

    await expect(
      uploadImmersiveVideoPart(
        { prisma, s3: createS3() },
        { id: 'video-1', partNumber: 1, part },
      ),
    ).rejects.toThrow('BAD_PART_SIZE')
  })

  it('upload.abort restores priorState', async () => {
    const { prisma, state } = createPrisma(
      baseRow({
        state: 'Republishing',
        priorState: 'Published',
        version: 1,
        objectKey: 'immersive-videos/video-1/v1.mp4',
        uploadId: 'upload-1',
        uploadObjectKey: 'immersive-videos/video-1/v2.mp4',
        uploadFilename: 'next.mp4',
        uploadSizeBytes: BigInt(10),
      }),
    )
    const s3 = createS3()

    const row = await abortImmersiveVideoUpload({ prisma, s3 }, 'video-1')
    expect(row.state).toBe('Published')
    expect(state.row.priorState).toBeNull()
    expect(state.row.uploadId).toBeNull()
    expect(s3.abortMultipartUpload).toHaveBeenCalled()
  })

  it('delete removes matching DeviceVideo rows', async () => {
    const { prisma, state } = createPrisma(
      baseRow({
        title: 'Trail',
        objectKey: 'immersive-videos/video-1/v1.mp4',
        thumbnailKey: 'immersive-videos/video-1/thumbnail-1.jpg',
      }),
    )
    const s3 = createS3()

    await deleteImmersiveVideo({ prisma, s3 }, 'video-1')
    expect(state.deletedDeviceVideoWhere).toEqual({
      where: { videoId: 'video-1' },
    })
    expect(state.deleted).toBe(true)
  })
})
