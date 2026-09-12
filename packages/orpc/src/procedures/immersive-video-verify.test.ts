import { Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'
import type { ImmersiveVideoRecord } from './immersive-video-constants.ts'
import type { ImmersiveVideoS3 } from './immersive-video-s3.ts'
import {
  runImmersiveVideoVerify,
  type ImmersiveVideoPrisma,
} from './immersive-video-service.ts'

const NOW = new Date('2026-09-12T12:00:00.000Z')

function verifyingRow(
  overrides: Partial<ImmersiveVideoRecord> = {},
): ImmersiveVideoRecord {
  return {
    id: 'video-1',
    title: 'Trail',
    activity: 'CYCLING',
    description: null,
    state: 'Verifying',
    priorState: 'Draft',
    version: 0,
    objectKey: null,
    sizeBytes: null,
    checksum: null,
    durationSec: null,
    filename: null,
    thumbnailKey: null,
    uploadId: 'upload-1',
    uploadObjectKey: 'immersive-videos/video-1/v1.mp4',
    uploadFilename: 'trail.mp4',
    uploadSizeBytes: BigInt(4),
    uploadDurationSec: 12,
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
    retired: [] as { videoId: string; version: number; objectKey: string }[],
  }

  const prisma = {
    immersiveVideo: {
      findUnique: vi.fn(async () => state.row),
      findMany: vi.fn(async () => [state.row]),
      create: vi.fn(),
      update: vi.fn(
        async ({ data }: { data: Partial<ImmersiveVideoRecord> }) => {
          state.row = { ...state.row, ...data }
          return state.row
        },
      ),
      delete: vi.fn(),
    },
    immersiveVideoRetiredObject: {
      create: vi.fn(
        async ({
          data,
        }: {
          data: { videoId: string; version: number; objectKey: string }
        }) => {
          state.retired.push(data)
          return data
        },
      ),
      findMany: vi.fn(async () => state.retired),
    },
    deviceVideo: {
      deleteMany: vi.fn(),
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
    getObjectStream: vi.fn(async () => Readable.from([Buffer.from('abcd')])),
    ...overrides,
  }
}

describe('immersive video verify', () => {
  it('promotes upload columns, bumps version 0 to 1, and retires the previous object', async () => {
    const { prisma, state } = createPrisma(
      verifyingRow({
        version: 0,
        objectKey: 'immersive-videos/video-1/v0.mp4',
      }),
    )
    const s3 = createS3()

    const row = await runImmersiveVideoVerify('video-1', { prisma, s3 })

    expect(row?.version).toBe(1)
    expect(row?.filename).toBe('trail.mp4')
    expect(row?.sizeBytes).toBe(4)
    expect(row?.durationSec).toBe(12)
    expect(row?.state).toBe('Draft')
    expect(state.row.checksum).toMatch(/^[a-f0-9]{64}$/)
    expect(state.row.objectKey).toBe('immersive-videos/video-1/v1.mp4')
    expect(state.row.uploadId).toBeNull()
    expect(state.retired).toEqual([
      {
        videoId: 'video-1',
        version: 0,
        objectKey: 'immersive-videos/video-1/v0.mp4',
      },
    ])
  })

  it('on size mismatch deletes the object, sets verifyFailedAt, and returns to Draft', async () => {
    const { prisma, state } = createPrisma(
      verifyingRow({ priorState: 'Draft' }),
    )
    const s3 = createS3({
      getObjectStream: vi.fn(async () => Readable.from([Buffer.from('ab')])),
    })

    const row = await runImmersiveVideoVerify('video-1', { prisma, s3 })

    expect(row?.state).toBe('Draft')
    expect(row?.verifyFailedAt).toBeInstanceOf(Date)
    expect(state.row.objectKey).toBeNull()
    expect(s3.deleteObject).toHaveBeenCalledWith({
      key: 'immersive-videos/video-1/v1.mp4',
    })
  })

  it('on size mismatch from a Published prior state keeps the live file and returns to Published', async () => {
    const { prisma, state } = createPrisma(
      verifyingRow({
        priorState: 'Published',
        version: 1,
        objectKey: 'immersive-videos/video-1/v1.mp4',
        sizeBytes: BigInt(8),
        checksum: 'live',
        filename: 'live.mp4',
        uploadObjectKey: 'immersive-videos/video-1/v2.mp4',
      }),
    )
    const s3 = createS3({
      getObjectStream: vi.fn(async () => Readable.from([Buffer.from('no')])),
    })

    const row = await runImmersiveVideoVerify('video-1', { prisma, s3 })

    expect(row?.state).toBe('Published')
    expect(row?.verifyFailedAt).toBeInstanceOf(Date)
    expect(state.row.objectKey).toBe('immersive-videos/video-1/v1.mp4')
    expect(state.row.filename).toBe('live.mp4')
    expect(s3.deleteObject).toHaveBeenCalledWith({
      key: 'immersive-videos/video-1/v2.mp4',
    })
  })
})
