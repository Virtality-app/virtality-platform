import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  mapCalTriggerToEventName,
  normalizeAnalyticsEmail,
  type WebsiteAnalyticsEventName,
} from '@/lib/analytics-contract'

export type CalWebhookAttendee = {
  email?: string
}

export type CalWebhookPayload = {
  triggerEvent?: string
  payload?: {
    uid?: string
    type?: string
    attendees?: CalWebhookAttendee[]
    responses?: {
      email?: { value?: string }
    }
  }
}

export function verifyCalWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

  try {
    const provided = Buffer.from(signatureHeader, 'utf8')
    const computed = Buffer.from(expected, 'utf8')
    if (provided.length !== computed.length) return false
    return timingSafeEqual(provided, computed)
  } catch {
    return false
  }
}

export function extractCalAttendeeEmail(
  payload: CalWebhookPayload['payload'],
): string | null {
  const fromAttendee = payload?.attendees?.[0]?.email
  if (fromAttendee?.trim()) {
    return normalizeAnalyticsEmail(fromAttendee)
  }

  const fromResponses = payload?.responses?.email?.value
  if (fromResponses?.trim()) {
    return normalizeAnalyticsEmail(fromResponses)
  }

  return null
}

export type ParsedCalBookingEvent = {
  eventName: Extract<
    WebsiteAnalyticsEventName,
    'demo_booked' | 'demo_requested'
  >
  distinctId: string
  properties: {
    source: 'cal_com'
    cal_trigger: 'BOOKING_CREATED' | 'BOOKING_REQUESTED'
    event_type?: string
    booking_uid?: string
  }
}

/**
 * Valid Cal payloads without an attendee email return null and should still
 * get HTTP 200 so Cal does not retry forever on incomplete data.
 */
export function parseCalBookingEvent(
  body: CalWebhookPayload,
): ParsedCalBookingEvent | null {
  const trigger = body.triggerEvent
  if (!trigger) return null

  const eventName = mapCalTriggerToEventName(trigger)
  if (!eventName) return null

  const distinctId = extractCalAttendeeEmail(body.payload)
  if (!distinctId) return null

  const cal_trigger =
    trigger === 'BOOKING_CREATED' ? 'BOOKING_CREATED' : 'BOOKING_REQUESTED'

  return {
    eventName,
    distinctId,
    properties: {
      source: 'cal_com',
      cal_trigger,
      event_type: body.payload?.type,
      booking_uid: body.payload?.uid,
    },
  }
}
