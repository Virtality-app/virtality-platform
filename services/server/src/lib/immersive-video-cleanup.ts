import type { AppLogger } from '@virtality/shared/observability'
import { findPairedDeviceByHeadsetIdentity } from './device-video-pairing.ts'

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
      where: { deviceId: string; AND: [{ deletedAt: null }] }
      select: { id: true }
    }) => Promise<{ id: string } | null>
  }
}

type CleanupLogger = Pick<AppLogger, 'info' | 'error'>

async function deleteUnusedRetiredObjects(input: {
  prisma: ImmersiveVideoCleanupPrisma
  s3: ImmersiveVideoCleanupS3
  logger: CleanupLogger
}): Promise<{ deleted: number; kept: number; failures: number }> {
  const { prisma, s3, logger } = input
  let deleted = 0
  let kept = 0
  let failures = 0

  const retired = await prisma.immersiveVideoRetiredObject.findMany()
  for (const row of retired) {
    try {
      const inUse = await prisma.deviceVideo.findFirst({
        where: { videoId: row.videoId, version: row.version },
      })
      if (inUse) {
        kept += 1
        continue
      }
      const removed = await s3.deleteFile({ Key: row.objectKey })
      if (removed == null) {
        throw new Error('S3 deleteFile returned null')
      }
      await prisma.immersiveVideoRetiredObject.delete({
        where: { id: row.id },
      })
      deleted += 1
    } catch (error) {
      failures += 1
      logger.error(
        'immersive-video.cleanup.retired.failed',
        { error, objectKey: row.objectKey, videoId: row.videoId },
        'Failed to clean a retired Immersive Video object',
      )
    }
  }

  return { deleted, kept, failures }
}

async function deleteStaleUnpairedReports(input: {
  prisma: ImmersiveVideoCleanupPrisma
  logger: CleanupLogger
  cutoff: Date
}): Promise<{ deleted: number; failures: number }> {
  const { prisma, logger, cutoff } = input
  let deleted = 0
  let failures = 0

  const reports = await prisma.deviceVideoReport.findMany()
  for (const report of reports) {
    try {
      if (report.reportedAt.getTime() >= cutoff.getTime()) {
        continue
      }
      const paired = await findPairedDeviceByHeadsetIdentity(
        prisma,
        report.deviceId,
      )
      if (paired) {
        continue
      }
      await prisma.deviceVideoReport.delete({
        where: { deviceId: report.deviceId },
      })
      deleted += 1
    } catch (error) {
      failures += 1
      logger.error(
        'immersive-video.cleanup.report.failed',
        { error, deviceId: report.deviceId },
        'Failed to clean a Library Mirror report',
      )
    }
  }

  return { deleted, failures }
}

export async function runImmersiveVideoCleanup(input: {
  prisma: ImmersiveVideoCleanupPrisma
  s3: ImmersiveVideoCleanupS3
  logger: CleanupLogger
  now?: () => Date
}): Promise<void> {
  const { prisma, s3, logger } = input
  const now = input.now?.() ?? new Date()

  const retired = await deleteUnusedRetiredObjects({ prisma, s3, logger })
  const reports = await deleteStaleUnpairedReports({
    prisma,
    logger,
    cutoff: new Date(now.getTime() - RETENTION_MS),
  })

  logger.info('immersive-video.cleanup.completed', {
    retiredDeleted: retired.deleted,
    retiredKept: retired.kept,
    reportsDeleted: reports.deleted,
    failures: retired.failures + reports.failures,
  })
}
