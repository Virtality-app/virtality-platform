import { Hono, type Context } from 'hono'
import { z } from 'zod/v4'
import { prisma } from '@virtality/db'
import {
  VIDEO_DOWNLOAD_FAILURE_REASON,
  type DeviceVideoReportBody,
} from '@virtality/shared/types'
import { DeviceVideoRouteError } from '../lib/device-video-errors.ts'
import { replaceDeviceVideoReport } from '../lib/device-video-report.ts'
import { getDownloadDescriptor } from '../lib/download-descriptor.ts'

const VIDEO_REPORT_STATUS = [
  'downloading',
  'paused',
  'ready',
  'failed',
] as const

const failureReasons = Object.values(VIDEO_DOWNLOAD_FAILURE_REASON) as [
  (typeof VIDEO_DOWNLOAD_FAILURE_REASON)[keyof typeof VIDEO_DOWNLOAD_FAILURE_REASON],
  ...(typeof VIDEO_DOWNLOAD_FAILURE_REASON)[keyof typeof VIDEO_DOWNLOAD_FAILURE_REASON][],
]

const DeviceVideoReportSchema = z.object({
  deviceId: z.string().trim().min(1).max(128),
  freeBytes: z.number().finite().nonnegative(),
  videos: z
    .array(
      z.object({
        videoId: z.string().min(1),
        status: z.enum(VIDEO_REPORT_STATUS),
        version: z.number().int().nonnegative().optional(),
        bytesDownloaded: z.number().finite().nonnegative().optional(),
        sizeBytes: z.number().finite().nonnegative().optional(),
        reason: z.enum(failureReasons).optional(),
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

deviceVideoRoutes.put('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = DeviceVideoReportSchema.safeParse(body)

  if (!parsed.success) {
    return c.json(
      { error: 'INVALID_REQUEST', message: 'Invalid device videos report.' },
      400,
    )
  }

  try {
    await replaceDeviceVideoReport(prisma, parsed.data as DeviceVideoReportBody)
    return c.body(null, 204)
  } catch (error) {
    if (error instanceof DeviceVideoRouteError) {
      return jsonError(c, error)
    }
    throw error
  }
})

deviceVideoRoutes.get('/:videoId', async (c) => {
  const videoIdParsed = VideoIdParamSchema.safeParse(c.req.param('videoId'))
  const deviceIdParsed = DeviceIdQuerySchema.safeParse(c.req.query('deviceId'))

  if (!videoIdParsed.success || !deviceIdParsed.success) {
    return c.json(
      { error: 'INVALID_REQUEST', message: 'Invalid download request.' },
      400,
    )
  }

  try {
    const descriptor = await getDownloadDescriptor(prisma, {
      deviceId: deviceIdParsed.data,
      videoId: videoIdParsed.data,
    })
    return c.json(descriptor)
  } catch (error) {
    if (error instanceof DeviceVideoRouteError) {
      return jsonError(c, error)
    }
    throw error
  }
})
