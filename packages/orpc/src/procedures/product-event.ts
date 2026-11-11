import { CLIENT_EVENT_NAMES, type ClientEventName } from '@virtality/analytics'
import { z } from 'zod'
import { authed } from '../middleware/auth.ts'

// Contract properties are ids, counts, durations and enum values, so a few
// short flat fields are all a real event carries.
const MAX_PROPERTIES = 20

const PropertyValueSchema = z.union([
  z.string().max(256),
  z.number(),
  z.boolean(),
  z.null(),
])

export const TrackProductEventSchema = z.object({
  /** The uuid PostHog gave its copy of the event. */
  id: z.uuid(),
  event: z.enum(CLIENT_EVENT_NAMES as [ClientEventName, ...ClientEventName[]]),
  properties: z
    .record(z.string().max(64), PropertyValueSchema)
    .refine((properties) => Object.keys(properties).length <= MAX_PROPERTIES),
  sessionId: z.string().max(128).optional(),
})

/**
 * Saves a console event to our database. The console sends it alongside the
 * PostHog capture, under the same uuid.
 */
const trackProductEvent = authed
  .route({ path: '/product-event/track', method: 'POST' })
  .input(TrackProductEventSchema)
  .handler(async ({ context, input }) => {
    // skipDuplicates: a retried request must not fail or save twice.
    await context.prisma.productEvent.createMany({
      data: [{ ...input, userId: context.user.id, source: 'client' }],
      skipDuplicates: true,
    })
  })

export const productEvent = {
  track: trackProductEvent,
}
