import type { VideoDownloadFailureReason } from '@virtality/shared/types'
import { authed } from '../middleware/auth.ts'

export type DeviceVideoListItem = {
  videoId: string
  status: 'downloading' | 'paused' | 'ready' | 'failed'
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

type DeviceVideoListPrisma = {
  device: {
    findMany: (args: {
      where: {
        userId: string
        AND: [{ deletedAt: null }]
        deviceId: { not: null }
      }
      orderBy: { name: 'asc' }
      select: { id: true; name: true; deviceId: true }
    }) => Promise<Array<{ id: string; name: string; deviceId: string | null }>>
  }
  deviceVideoReport: {
    findMany: (args: {
      where: { deviceId: { in: string[] } }
      include: { videos: true }
    }) => Promise<
      Array<{
        deviceId: string
        freeBytes: bigint | number
        reportedAt: Date
        videos: Array<{
          videoId: string
          status: DeviceVideoListItem['status']
          version: number | null
          bytesDownloaded: bigint | number | null
          sizeBytes: bigint | number | null
          reason: VideoDownloadFailureReason | null
        }>
      }>
    >
  }
}

function toOptionalNumber(value: bigint | number | null): number | null {
  if (value == null) {
    return null
  }
  return Number(value)
}

export async function listDeviceVideosForUser(
  prisma: DeviceVideoListPrisma,
  userId: string,
): Promise<DeviceVideoListForUserResult> {
  const devices = await prisma.device.findMany({
    where: {
      userId,
      AND: [{ deletedAt: null }],
      deviceId: { not: null },
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, deviceId: true },
  })

  const identities = devices
    .map((device) => device.deviceId)
    .filter((deviceId): deviceId is string => deviceId != null)

  const reports =
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
    devices: devices.map((device) => {
      const deviceId = device.deviceId as string
      const report = reportsByIdentity.get(deviceId)
      return {
        id: device.id,
        name: device.name,
        deviceId,
        report: report
          ? {
              reportedAt: report.reportedAt.toISOString(),
              freeBytes: Number(report.freeBytes),
              videos: report.videos.map((video) => ({
                videoId: video.videoId,
                status: video.status,
                version: video.version,
                bytesDownloaded: toOptionalNumber(video.bytesDownloaded),
                sizeBytes: toOptionalNumber(video.sizeBytes),
                reason: video.reason,
              })),
            }
          : null,
      }
    }),
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
