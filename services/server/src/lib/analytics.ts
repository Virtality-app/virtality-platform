import { createServerAnalytics } from '@virtality/analytics/server'
import { createAppLogger } from '@virtality/shared/observability'

const logger = createAppLogger({
  serviceName: 'server',
  defaultAttributes: { component: 'analytics' },
})

// Must be the console's PostHog project key, so server events land on the
// same persons the console identifies. Unset → analytics is a no-op.
const apiKey = process.env.POSTHOG_PROJECT_TOKEN

if (!apiKey) {
  logger.warn('analytics.disabled', { reason: 'POSTHOG_PROJECT_TOKEN unset' })
}

export const analytics = createServerAnalytics({
  apiKey,
  host: process.env.POSTHOG_HOST,
  onError: (error) => {
    logger.error('analytics.capture_failed', {
      error: error instanceof Error ? error.message : String(error),
    })
  },
})
