import { serverLogger } from '@/lib/server-logger'

const logger = serverLogger.child({
  component: 'website-posthog-server',
})

export async function captureServerSideEvent(input: {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}): Promise<boolean> {
  const token =
    process.env.POSTHOG_PROJECT_TOKEN ??
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

  if (!token) {
    logger.warn('website.posthog.server_token_missing')
    return false
  }

  const host =
    process.env.POSTHOG_HOST ??
    process.env.NEXT_PUBLIC_POSTHOG_HOST ??
    'https://eu.i.posthog.com'

  const response = await fetch(`${host.replace(/\/$/, '')}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: token,
      event: input.event,
      distinct_id: input.distinctId,
      properties: {
        ...input.properties,
        $lib: 'website-server',
      },
    }),
  })

  if (!response.ok) {
    logger.error('website.posthog.capture_failed', {
      status: response.status,
      event: input.event,
    })
    return false
  }

  return true
}
