import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  captureWebsiteEvent,
  hasAnalyticsConsent,
  mapCalTriggerToEventName,
  normalizeAnalyticsEmail,
} from './analytics-contract'
import {
  extractCalAttendeeEmail,
  parseCalBookingEvent,
  verifyCalWebhookSignature,
} from './cal-webhook'

function stubLocalStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('analytics-contract', () => {
  it('normalizes emails', () => {
    expect(normalizeAnalyticsEmail('  Ada@Example.COM ')).toBe(
      'ada@example.com',
    )
  })

  it('maps Cal triggers to event names', () => {
    expect(mapCalTriggerToEventName('BOOKING_CREATED')).toBe('demo_booked')
    expect(mapCalTriggerToEventName('BOOKING_REQUESTED')).toBe('demo_requested')
    expect(mapCalTriggerToEventName('BOOKING_CANCELLED')).toBeNull()
  })

  it('reports consent from localStorage', () => {
    stubLocalStorage()
    expect(hasAnalyticsConsent()).toBe(false)
    localStorage.setItem('analytics:consent', 'granted')
    expect(hasAnalyticsConsent()).toBe(true)
  })

  it('no-ops capture without consent', () => {
    stubLocalStorage()
    expect(
      captureWebsiteEvent('waitlist_joined', { cta_location: 'final_cta' }),
    ).toBe(false)
  })
})

describe('cal-webhook', () => {
  const secret = 'test-secret'
  const body = JSON.stringify({
    triggerEvent: 'BOOKING_CREATED',
    payload: {
      uid: 'booking_1',
      type: '20min',
      attendees: [{ email: 'Guest@Example.com' }],
    },
  })

  it('verifies a valid HMAC signature', () => {
    const signature = createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyCalWebhookSignature(body, signature, secret)).toBe(true)
  })

  it('rejects an invalid signature', () => {
    expect(verifyCalWebhookSignature(body, 'deadbeef', secret)).toBe(false)
    expect(verifyCalWebhookSignature(body, null, secret)).toBe(false)
  })

  it('extracts and normalizes attendee email', () => {
    expect(
      extractCalAttendeeEmail({
        attendees: [{ email: ' Guest@Example.com ' }],
      }),
    ).toBe('guest@example.com')
  })

  it('parses BOOKING_CREATED into demo_booked', () => {
    const parsed = parseCalBookingEvent(JSON.parse(body))
    expect(parsed).toEqual({
      eventName: 'demo_booked',
      distinctId: 'guest@example.com',
      properties: {
        source: 'cal_com',
        cal_trigger: 'BOOKING_CREATED',
        event_type: '20min',
        booking_uid: 'booking_1',
      },
    })
  })

  it('parses BOOKING_REQUESTED into demo_requested', () => {
    const parsed = parseCalBookingEvent({
      triggerEvent: 'BOOKING_REQUESTED',
      payload: {
        attendees: [{ email: 'a@b.com' }],
      },
    })
    expect(parsed?.eventName).toBe('demo_requested')
  })

  it('returns null for missing email so the route can ack without capturing', () => {
    expect(
      parseCalBookingEvent({
        triggerEvent: 'BOOKING_CREATED',
        payload: { attendees: [] },
      }),
    ).toBeNull()
  })

  it('returns null for unknown triggers', () => {
    expect(
      parseCalBookingEvent({
        triggerEvent: 'BOOKING_CANCELLED',
        payload: { attendees: [{ email: 'a@b.com' }] },
      }),
    ).toBeNull()
  })
})
