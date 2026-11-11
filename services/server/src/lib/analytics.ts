import { createServerAnalytics } from '@virtality/analytics/server'
import { prisma, type Prisma } from '@virtality/db'
import { createAppLogger } from '@virtality/shared/observability'

const logger = createAppLogger({
  serviceName: 'server',
  defaultAttributes: { component: 'analytics' },
})

// Must be the console's PostHog project key, so server events land on the
// same persons the console identifies. Unset → events are only saved to our
// database.
const apiKey = process.env.POSTHOG_PROJECT_TOKEN

if (!apiKey) {
  logger.warn('analytics.posthog_disabled', {
    reason: 'POSTHOG_PROJECT_TOKEN unset',
  })
}

export const analytics = createServerAnalytics({
  apiKey,
  host: process.env.POSTHOG_HOST,
  // Our own copy of every event, saved whether or not PostHog is configured.
  store: async ({ properties, ...event }) => {
    await prisma.productEvent.create({
      data: { ...event, properties: properties as Prisma.InputJsonValue },
    })
  },
  onError: (error) => {
    logger.error('analytics.capture_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
  },
})
