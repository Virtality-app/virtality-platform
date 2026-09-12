import { Hono, type Context } from 'hono'
import { z } from 'zod/v4'
import { prisma } from '@virtality/db'
import {
  VIDEO_DEVICE_STATUS,
  VIDEO_DOWNLOAD_FAILURE_REASON,
} from '@virtality/shared/types'
import {
  DeviceVideoRouteError,
  invalidRequestError,
} from '../lib/device-video-errors.ts'
import { replaceDeviceVideoReport } from '../lib/device-video-report.ts'
import { getDownloadDescriptor } from '../lib/download-descriptor.ts'

const DeviceVideoReportSchema = z.object({
  deviceId: z.string().trim().min(1).max(128),
  freeBytes: z.number().finite().nonnegative(),
  videos: z
    .array(
      z.object({
        videoId: z.string().min(1),
        status: z.enum([
          VIDEO_DEVICE_STATUS.Downloading,
          VIDEO_DEVICE_STATUS.Paused,
          VIDEO_DEVICE_STATUS.Ready,
          VIDEO_DEVICE_STATUS.Failed,
        ]),
        version: z.number().int().nonnegative().optional(),
        bytesDownloaded: z.number().finite().nonnegative().optional(),
        sizeBytes: z.number().finite().nonnegative().optional(),
        reason: z
          .enum([
            VIDEO_DOWNLOAD_FAILURE_REASON.InsufficientStorage,
            VIDEO_DOWNLOAD_FAILURE_REASON.Network,
            VIDEO_DOWNLOAD_FAILURE_REASON.ChecksumMismatch,
            VIDEO_DOWNLOAD_FAILURE_REASON.Cancelled,
            VIDEO_DOWNLOAD_FAILURE_REASON.UrlExpired,
            VIDEO_DOWNLOAD_FAILURE_REASON.Unavailable,
          ])
          .optional(),
      }),
    )
    .max(64),
})

const DeviceIdQuerySchema = z.string().trim().min(1).max(128)
const VideoIdParamSchema = z.string().min(1)

export const deviceVideoRoutes = new Hono()

deviceVideoRoutes.use('*', async (c, next) => {
  await next()
  c.header('Cache-Control', 'no-store')
})

function jsonError(c: Context, error: DeviceVideoRouteError) {
  return c.json({ error: error.code, message: error.message }, error.status)
}

function catchDeviceVideoError(c: Context, error: unknown) {
  if (error instanceof DeviceVideoRouteError) {
    return jsonError(c, error)
  }
  throw error
}

deviceVideoRoutes.put('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = DeviceVideoReportSchema.safeParse(body)

  if (!parsed.success) {
    return jsonError(c, invalidRequestError('Invalid device videos report.'))
  }

  try {
    await replaceDeviceVideoReport(prisma, parsed.data)
    return c.body(null, 204)
  } catch (error) {
    return catchDeviceVideoError(c, error)
  }
})

deviceVideoRoutes.get('/:videoId', async (c) => {
  const videoIdParsed = VideoIdParamSchema.safeParse(c.req.param('videoId'))
  const deviceIdParsed = DeviceIdQuerySchema.safeParse(c.req.query('deviceId'))

  if (!videoIdParsed.success || !deviceIdParsed.success) {
    return jsonError(c, invalidRequestError('Invalid download request.'))
  }

  try {
    const descriptor = await getDownloadDescriptor(prisma, {
      deviceId: deviceIdParsed.data,
      videoId: videoIdParsed.data,
    })
    return c.json(descriptor)
  } catch (error) {
    return catchDeviceVideoError(c, error)
  }
})
