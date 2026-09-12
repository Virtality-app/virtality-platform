import cron, { type ScheduledTask } from 'node-cron'
import type { AppLogger } from '@virtality/shared/observability'
import { prisma } from '@virtality/db'
import { virtalityS3 } from '@virtality/orpc/s3'
import {
  createImmersiveVideoS3,
  sweepImmersiveVideoVerify,
} from '@virtality/orpc/server'

const VERIFY_CRON = '*/5 * * * *'

export function scheduleImmersiveVideoVerify(
  logger: AppLogger,
): ScheduledTask | null {
  if (process.env.IMMERSIVE_VIDEO_VERIFY_ENABLED === 'false') {
    return null
  }

  const jobLogger = logger.child({
    component: 'immersive-video',
    job: 'immersive-video-verify',
  })
  const s3 = createImmersiveVideoS3(virtalityS3)

  return cron.schedule(
    VERIFY_CRON,
    () => {
      void sweepImmersiveVideoVerify({
        prisma: prisma as never,
        s3,
      }).catch((error) => {
        jobLogger.error(
          'immersive-video.verify.sweep.failed',
          { error },
          'Scheduled Immersive Video verify sweep failed',
        )
      })
    },
    { timezone: 'UTC' },
  )
}
