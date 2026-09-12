import type { DeviceVideoReportBody } from '@virtality/shared/types'
import { unpairedHeadsetError } from './device-video-errors.ts'
import { findPairedDeviceByHeadsetIdentity } from './device-video-pairing.ts'

type DeviceVideoStatus = 'downloading' | 'paused' | 'ready' | 'failed'

type ReportPrisma = {
  device: {
    findFirst: (args: {
      where: { deviceId: string; AND: [{ deletedAt: null }] }
      select: { id: true }
    }) => Promise<{ id: string } | null>
  }
  deviceVideoReport: {
    upsert: (args: {
      where: { deviceId: string }
      create: { deviceId: string; freeBytes: bigint; reportedAt: Date }
      update: { freeBytes: bigint; reportedAt: Date }
    }) => Promise<unknown>
  }
  deviceVideo: {
    deleteMany: (args: { where: { deviceId: string } }) => Promise<unknown>
    createMany: (args: {
      data: Array<{
        deviceId: string
        videoId: string
        status: DeviceVideoStatus
        version: number | null
        bytesDownloaded: bigint | null
        sizeBytes: bigint | null
        reason: DeviceVideoReportBody['videos'][number]['reason'] | null
      }>
    }) => Promise<unknown>
  }
  $transaction: <T>(fn: (tx: ReportPrisma) => Promise<T>) => Promise<T>
}

function toOptionalBigInt(value: number | undefined): bigint | null {
  if (value == null) {
    return null
  }
  return BigInt(Math.trunc(value))
}

export async function replaceDeviceVideoReport(
  prisma: ReportPrisma,
  body: DeviceVideoReportBody,
): Promise<void> {
  const paired = await findPairedDeviceByHeadsetIdentity(prisma, body.deviceId)
  if (!paired) {
    throw unpairedHeadsetError()
  }

  const reportedAt = new Date()
  const freeBytes = BigInt(Math.trunc(body.freeBytes))

  await prisma.$transaction(async (tx) => {
    await tx.deviceVideoReport.upsert({
      where: { deviceId: body.deviceId },
      create: {
        deviceId: body.deviceId,
        freeBytes,
        reportedAt,
      },
      update: {
        freeBytes,
        reportedAt,
      },
    })
    await tx.deviceVideo.deleteMany({ where: { deviceId: body.deviceId } })
    if (body.videos.length === 0) {
      return
    }
    await tx.deviceVideo.createMany({
      data: body.videos.map((video) => ({
        deviceId: body.deviceId,
        videoId: video.videoId,
        status: video.status as DeviceVideoStatus,
        version: video.version ?? null,
        bytesDownloaded: toOptionalBigInt(video.bytesDownloaded),
        sizeBytes: toOptionalBigInt(video.sizeBytes),
        reason: video.reason ?? null,
      })),
    })
  })
}
