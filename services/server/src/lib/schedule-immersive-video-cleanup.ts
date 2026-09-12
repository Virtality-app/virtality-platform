import cron, { type ScheduledTask } from 'node-cron'
import type { AppLogger } from '@virtality/shared/observability'
import { prisma } from '@virtality/db'
import { virtalityS3 } from '@virtality/orpc/s3'
import { runImmersiveVideoCleanup } from './immersive-video-cleanup.ts'

const CLEANUP_CRON = '0 3 * * *'

export function scheduleImmersiveVideoCleanup(
  logger: AppLogger,
): ScheduledTask | null {
  if (process.env.IMMERSIVE_VIDEO_CLEANUP_ENABLED === 'false') {
    return null
  }

  const jobLogger = logger.child({
    component: 'immersive-video',
    job: 'immersive-video-cleanup',
  })

  return cron.schedule(
    CLEANUP_CRON,
    () => {
      void runImmersiveVideoCleanup({
        prisma,
        s3: virtalityS3,
        logger: jobLogger,
      }).catch((error) => {
        jobLogger.error(
          'immersive-video.cleanup.failed',
          { error },
          'Scheduled Immersive Video cleanup failed',
        )
      })
    },
    { timezone: 'UTC' },
  )
}
