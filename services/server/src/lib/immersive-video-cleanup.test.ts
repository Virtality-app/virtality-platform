import { describe, expect, it, vi } from 'vitest'
import { runImmersiveVideoCleanup } from './immersive-video-cleanup.ts'

const NOW = new Date('2026-09-12T12:00:00.000Z')
const DAY = 24 * 60 * 60 * 1000

function createLogger() {
  return {
    info: vi.fn(),
    error: vi.fn(),
  }
}

function createCleanupState(input?: {
  retired?: Array<{
    id: string
    videoId: string
    version: number
    objectKey: string
  }>
  deviceVideos?: Array<{ videoId: string; version: number }>
  reports?: Array<{ deviceId: string; reportedAt: Date }>
  devices?: Array<{ deviceId: string; deletedAt: Date | null }>
}) {
  const retired = [...(input?.retired ?? [])]
  const deviceVideos = [...(input?.deviceVideos ?? [])]
  const reports = [...(input?.reports ?? [])]
  const devices = [...(input?.devices ?? [])]
  const deletedFiles: string[] = []

  const prisma = {
    immersiveVideoRetiredObject: {
      findMany: vi.fn(async () => retired),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        const index = retired.findIndex((row) => row.id === where.id)
        if (index >= 0) {
          retired.splice(index, 1)
        }
      }),
    },
    deviceVideo: {
      findFirst: vi.fn(
        async ({ where }: { where: { videoId: string; version: number } }) =>
          deviceVideos.find(
            (row) =>
              row.videoId === where.videoId && row.version === where.version,
          ) ?? null,
      ),
    },
    deviceVideoReport: {
      findMany: vi.fn(async () => reports),
      delete: vi.fn(async ({ where }: { where: { deviceId: string } }) => {
        const index = reports.findIndex(
          (row) => row.deviceId === where.deviceId,
        )
        if (index >= 0) {
          reports.splice(index, 1)
        }
      }),
    },
    device: {
      findFirst: vi.fn(
        async ({ where }: { where: { deviceId: string; deletedAt: null } }) =>
          devices.find(
            (device) =>
              device.deviceId === where.deviceId && device.deletedAt == null,
          ) ?? null,
      ),
    },
  }

  const s3 = {
    deleteFile: vi.fn(async ({ Key }: { Key: string }) => {
      deletedFiles.push(Key)
      return {}
    }),
  }

  return { prisma, s3, retired, reports, deletedFiles }
}

describe('runImmersiveVideoCleanup', () => {
  it('keeps a retired object while a mirror row names that version', async () => {
    const { prisma, s3, retired } = createCleanupState({
      retired: [
        {
          id: 'retired-1',
          videoId: 'video-1',
          version: 1,
          objectKey: 'immersive-videos/video-1/v1.mp4',
        },
      ],
      deviceVideos: [{ videoId: 'video-1', version: 1 }],
    })

    await runImmersiveVideoCleanup({
      prisma,
      s3,
      logger: createLogger(),
      now: () => NOW,
    })

    expect(s3.deleteFile).not.toHaveBeenCalled()
    expect(retired).toHaveLength(1)
  })

  it('deletes the S3 object and retired row when no mirror names that version', async () => {
    const { prisma, s3, retired, deletedFiles } = createCleanupState({
      retired: [
        {
          id: 'retired-1',
          videoId: 'video-1',
          version: 1,
          objectKey: 'immersive-videos/video-1/v1.mp4',
        },
      ],
      deviceVideos: [{ videoId: 'video-1', version: 2 }],
    })

    await runImmersiveVideoCleanup({
      prisma,
      s3,
      logger: createLogger(),
      now: () => NOW,
    })

    expect(deletedFiles).toEqual(['immersive-videos/video-1/v1.mp4'])
    expect(retired).toHaveLength(0)
  })

  it('keeps a report younger than 180 days even when unpaired', async () => {
    const { prisma, s3, reports } = createCleanupState({
      reports: [
        {
          deviceId: 'old-headset',
          reportedAt: new Date(NOW.getTime() - 10 * DAY),
        },
      ],
    })

    await runImmersiveVideoCleanup({
      prisma,
      s3,
      logger: createLogger(),
      now: () => NOW,
    })

    expect(reports).toHaveLength(1)
  })

  it('deletes an unpaired report older than 180 days', async () => {
    const { prisma, s3, reports } = createCleanupState({
      reports: [
        {
          deviceId: 'old-headset',
          reportedAt: new Date(NOW.getTime() - 181 * DAY),
        },
      ],
    })

    await runImmersiveVideoCleanup({
      prisma,
      s3,
      logger: createLogger(),
      now: () => NOW,
    })

    expect(reports).toHaveLength(0)
  })

  it("never deletes a paired identity's report regardless of age", async () => {
    const { prisma, s3, reports } = createCleanupState({
      reports: [
        {
          deviceId: 'headset-1',
          reportedAt: new Date(NOW.getTime() - 400 * DAY),
        },
      ],
      devices: [{ deviceId: 'headset-1', deletedAt: null }],
    })

    await runImmersiveVideoCleanup({
      prisma,
      s3,
      logger: createLogger(),
      now: () => NOW,
    })

    expect(reports).toHaveLength(1)
    expect(s3.deleteFile).not.toHaveBeenCalled()
  })
})
