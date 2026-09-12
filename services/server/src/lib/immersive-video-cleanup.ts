import type { AppLogger } from '@virtality/shared/observability'

const RETENTION_MS = 180 * 24 * 60 * 60 * 1000

export type ImmersiveVideoCleanupS3 = {
  deleteFile: (input: { Key: string }) => Promise<unknown | null>
}

export type ImmersiveVideoCleanupPrisma = {
  immersiveVideoRetiredObject: {
    findMany: () => Promise<
      Array<{
        id: string
        videoId: string
        version: number
        objectKey: string
      }>
    >
    delete: (args: { where: { id: string } }) => Promise<unknown>
  }
  deviceVideo: {
    findFirst: (args: {
      where: { videoId: string; version: number }
    }) => Promise<{ videoId: string } | null>
  }
  deviceVideoReport: {
    findMany: () => Promise<Array<{ deviceId: string; reportedAt: Date }>>
    delete: (args: { where: { deviceId: string } }) => Promise<unknown>
  }
  device: {
    findFirst: (args: {
      where: { deviceId: string; deletedAt: null }
    }) => Promise<object | null>
  }
}

export async function runImmersiveVideoCleanup(input: {
  prisma: ImmersiveVideoCleanupPrisma
  s3: ImmersiveVideoCleanupS3
  logger: Pick<AppLogger, 'info' | 'error'>
  now?: () => Date
}): Promise<void> {
  const { prisma, s3, logger } = input
  const now = input.now?.() ?? new Date()

  let retiredDeleted = 0
  let retiredKept = 0
  let reportsDeleted = 0
  let failures = 0

  const retired = await prisma.immersiveVideoRetiredObject.findMany()
  for (const row of retired) {
    try {
      const inUse = await prisma.deviceVideo.findFirst({
        where: { videoId: row.videoId, version: row.version },
      })
      if (inUse) {
        retiredKept += 1
        continue
      }
      const deleted = await s3.deleteFile({ Key: row.objectKey })
      if (deleted == null) {
        throw new Error('S3 deleteFile returned null')
      }
      await prisma.immersiveVideoRetiredObject.delete({
        where: { id: row.id },
      })
      retiredDeleted += 1
    } catch (error) {
      failures += 1
      logger.error(
        'immersive-video.cleanup.retired.failed',
        { error, objectKey: row.objectKey, videoId: row.videoId },
        'Failed to clean a retired Immersive Video object',
      )
    }
  }

  const cutoff = new Date(now.getTime() - RETENTION_MS)
  const reports = await prisma.deviceVideoReport.findMany()
  for (const report of reports) {
    try {
      if (report.reportedAt.getTime() >= cutoff.getTime()) {
        continue
      }
      const paired = await prisma.device.findFirst({
        where: { deviceId: report.deviceId, deletedAt: null },
      })
      if (paired) {
        continue
      }
      await prisma.deviceVideoReport.delete({
        where: { deviceId: report.deviceId },
      })
      reportsDeleted += 1
    } catch (error) {
      failures += 1
      logger.error(
        'immersive-video.cleanup.report.failed',
        { error, deviceId: report.deviceId },
        'Failed to clean a Library Mirror report',
      )
    }
  }

  logger.info('immersive-video.cleanup.completed', {
    retiredDeleted,
    retiredKept,
    reportsDeleted,
    failures,
  })
}
