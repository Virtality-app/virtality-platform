import type { DeviceVideoStatus, PrismaClient } from '@virtality/db'
import type { VideoDownloadFailureReason } from '@virtality/shared/types'
import { authed } from '../middleware/auth.ts'
import { toSizeBytesNumber } from './immersive-video-constants.ts'

export type DeviceVideoListItem = {
  videoId: string
  status: DeviceVideoStatus
  version: number | null
  bytesDownloaded: number | null
  sizeBytes: number | null
  reason: VideoDownloadFailureReason | null
}

export type DeviceVideoListForUserResult = {
  devices: Array<{
    id: string
    name: string
    deviceId: string
    report: null | {
      reportedAt: string
      freeBytes: number
      videos: DeviceVideoListItem[]
    }
  }>
}

type DeviceVideoReportRow = {
  deviceId: string
  freeBytes: bigint | number
  reportedAt: Date
  videos: Array<{
    videoId: string
    status: DeviceVideoStatus
    version: number | null
    bytesDownloaded: bigint | number | null
    sizeBytes: bigint | number | null
    reason: VideoDownloadFailureReason | null
  }>
}

function toBoundDevice(device: {
  id: string
  name: string
  deviceId: string | null
}): { id: string; name: string; deviceId: string } | null {
  if (device.deviceId == null) {
    return null
  }
  return { id: device.id, name: device.name, deviceId: device.deviceId }
}

function toListReport(
  report: DeviceVideoReportRow | undefined,
): DeviceVideoListForUserResult['devices'][number]['report'] {
  if (!report) {
    return null
  }

  return {
    reportedAt: report.reportedAt.toISOString(),
    freeBytes: Number(report.freeBytes),
    videos: report.videos.map((video) => ({
      videoId: video.videoId,
      status: video.status,
      version: video.version,
      bytesDownloaded: toSizeBytesNumber(video.bytesDownloaded),
      sizeBytes: toSizeBytesNumber(video.sizeBytes),
      reason: video.reason,
    })),
  }
}

export async function listDeviceVideosForUser(
  prisma: PrismaClient,
  userId: string,
): Promise<DeviceVideoListForUserResult> {
  const rows = await prisma.device.findMany({
    where: {
      userId,
      AND: [{ deletedAt: null }],
      deviceId: { not: null },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, deviceId: true },
  })

  const devices = rows.flatMap((device) => {
    const bound = toBoundDevice(device)
    return bound ? [bound] : []
  })

  const identities = devices.map((device) => device.deviceId)
  const reports: DeviceVideoReportRow[] =
    identities.length === 0
      ? []
      : await prisma.deviceVideoReport.findMany({
          where: { deviceId: { in: identities } },
          include: { videos: true },
        })

  const reportsByIdentity = new Map(
    reports.map((report) => [report.deviceId, report]),
  )

  return {
    devices: devices.map((device) => ({
      id: device.id,
      name: device.name,
      deviceId: device.deviceId,
      report: toListReport(reportsByIdentity.get(device.deviceId)),
    })),
  }
}

const listForUser = authed
  .route({ path: '/device-video/list-for-user', method: 'GET' })
  .handler(async ({ context }) =>
    listDeviceVideosForUser(context.prisma, context.user.id),
  )

export const deviceVideo = {
  listForUser,
}
