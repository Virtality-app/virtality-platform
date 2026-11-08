import { PostHog } from 'posthog-node'
import type {
  PersonProperties,
  ServerEventName,
  ServerEventPayloadMap,
} from './contract.ts'

export type ServerCaptureInput<TEvent extends ServerEventName> = {
  /** The clinician's user id — the same distinct id the console identifies. */
  distinctId: string
  event: TEvent
  properties: ServerEventPayloadMap[TEvent]
  set?: PersonProperties
  setOnce?: PersonProperties
}

export type ServerAnalytics = {
  /** Fire-and-forget. Never throws, so it can never fail the request. */
  capture<TEvent extends ServerEventName>(
    input: ServerCaptureInput<TEvent>,
  ): void
  /** Flush queued events. Call on process shutdown. */
  shutdown(): Promise<void>
}

type CaptureClient = Pick<PostHog, 'capture' | 'shutdown'>

export const noopServerAnalytics: ServerAnalytics = {
  capture: () => {},
  shutdown: async () => {},
}

export type CreateServerAnalyticsOptions = {
  apiKey?: string
  host?: string
  onError?: (error: unknown) => void
  /** Test seam: replaces the PostHog client. */
  client?: CaptureClient
}

/** Returns a no-op client when no API key is configured. */
export function createServerAnalytics({
  apiKey,
  host,
  onError,
  client,
}: CreateServerAnalyticsOptions): ServerAnalytics {
  if (!client && !apiKey) return noopServerAnalytics

  const posthog =
    client ?? new PostHog(apiKey!, { host: host ?? 'https://eu.i.posthog.com' })

  return {
    capture({ distinctId, event, properties, set, setOnce }) {
      try {
        posthog.capture({
          distinctId,
          event,
          properties: {
            ...properties,
            ...(set ? { $set: set } : {}),
            ...(setOnce ? { $set_once: setOnce } : {}),
          },
        })
      } catch (error) {
        onError?.(error)
      }
    },
    async shutdown() {
      try {
        await posthog.shutdown()
      } catch (error) {
        onError?.(error)
      }
    },
  }
}
