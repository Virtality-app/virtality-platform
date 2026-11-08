import posthog from 'posthog-js'
import type {
  ClientEventName,
  ClientEventPayloadMap,
} from '@virtality/analytics'

export type AnalyticsEventName = ClientEventName

export type AnalyticsEventProps<TEvent extends ClientEventName> =
  ClientEventPayloadMap[TEvent]

/**
 * The console's only path to `posthog.capture`. Event names and payloads come
 * from `@virtality/analytics`; events the API persists are captured
 * server-side instead.
 */
export const trackAnalyticsEvent = <TEvent extends ClientEventName>(
  name: TEvent,
  properties: ClientEventPayloadMap[TEvent],
) => {
  posthog.capture(name, properties as Record<string, unknown>)
}
