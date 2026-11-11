import posthog from 'posthog-js'
import type {
  ClientEventName,
  ClientEventPayloadMap,
} from '@virtality/analytics'
import { getORPC } from '@virtality/react-query'

export type AnalyticsEventName = ClientEventName

export type AnalyticsEventProps<TEvent extends ClientEventName> =
  ClientEventPayloadMap[TEvent]

/**
 * The console's only path to `posthog.capture`. Event names and payloads come
 * from `@virtality/analytics`; events the API persists are captured
 * server-side instead.
 *
 * Each event also goes to our own database under PostHog's uuid. When PostHog
 * drops the event (the user declined analytics), it isn't saved either.
 */
export const trackAnalyticsEvent = <TEvent extends ClientEventName>(
  name: TEvent,
  properties: ClientEventPayloadMap[TEvent],
) => {
  const captured = posthog.capture(name, properties as Record<string, unknown>)
  if (!captured) return

  const sessionId = captured.properties.$session_id
  try {
    getORPC()
      .productEvent.track.call({
        id: captured.uuid,
        event: name,
        properties: properties as Record<string, string | number | boolean>,
        sessionId: typeof sessionId === 'string' ? sessionId : undefined,
      })
      // Analytics never breaks the UI; PostHog still has the event.
      .catch(() => {})
  } catch {
    // The oRPC client isn't set up yet (before ORPCProvider renders).
  }
}
