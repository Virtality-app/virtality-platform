import { randomUUID } from 'node:crypto'
import { PostHog } from 'posthog-node'
import type {
  PersonProperties,
  ServerEventName,
  ServerEventPayloadMap,
  StoredProductEvent,
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

/** Saves an event to our own database. */
export type ProductEventStore = (event: StoredProductEvent) => Promise<void>

export const noopServerAnalytics: ServerAnalytics = {
  capture: () => {},
  shutdown: async () => {},
}

export type CreateServerAnalyticsOptions = {
  apiKey?: string
  host?: string
  /** Saves each event to our database too, under the uuid PostHog gets. */
  store?: ProductEventStore
  onError?: (error: unknown) => void
  /** Test seam: replaces the PostHog client. */
  client?: CaptureClient
  /** Test seam: replaces the event uuid generator. */
  createId?: () => string
}

/**
 * Sends each event to PostHog and to `store`. Either one can be missing:
 * without an API key events are only stored, and with neither this is a no-op.
 */
export function createServerAnalytics({
  apiKey,
  host,
  store,
  onError,
  client,
  createId = randomUUID,
}: CreateServerAnalyticsOptions): ServerAnalytics {
  const posthog =
    client ??
    (apiKey
      ? new PostHog(apiKey, { host: host ?? 'https://eu.i.posthog.com' })
      : undefined)

  if (!posthog && !store) return noopServerAnalytics

  // Writes still in flight, so shutdown can wait for them.
  const pendingWrites = new Set<Promise<void>>()

  const saveEvent = (event: StoredProductEvent) => {
    if (!store) return
    const write = Promise.resolve()
      .then(() => store(event))
      .catch((error: unknown) => onError?.(error))
      .finally(() => pendingWrites.delete(write))
    pendingWrites.add(write)
  }

  return {
    capture({ distinctId, event, properties, set, setOnce }) {
      const id = createId()

      saveEvent({
        id,
        event,
        userId: distinctId,
        properties,
        source: 'server',
      })

      try {
        posthog?.capture({
          uuid: id,
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
      await Promise.all(pendingWrites)
      try {
        await posthog?.shutdown()
      } catch (error) {
        onError?.(error)
      }
    },
  }
}
