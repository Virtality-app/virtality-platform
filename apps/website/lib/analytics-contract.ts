import posthog from 'posthog-js'

export const waitlistCtaLocations = ['final_cta', 'waitlist_page'] as const

export type WaitlistCtaLocation = (typeof waitlistCtaLocations)[number]

export const websiteAnalyticsEventNames = [
  'waitlist_joined',
  'demo_booked',
  'demo_requested',
] as const

export type WebsiteAnalyticsEventName =
  (typeof websiteAnalyticsEventNames)[number]

export type WebsiteAnalyticsEventPayloadMap = {
  waitlist_joined: {
    cta_location: WaitlistCtaLocation
  }
  demo_booked: {
    source: 'cal_com'
    cal_trigger: 'BOOKING_CREATED'
    event_type?: string
    booking_uid?: string
  }
  demo_requested: {
    source: 'cal_com'
    cal_trigger: 'BOOKING_REQUESTED'
    event_type?: string
    booking_uid?: string
  }
}

export const ANALYTICS_CONSENT_STORAGE_KEY = 'analytics:consent' as const

export function hasAnalyticsConsent(): boolean {
  try {
    return (
      globalThis.localStorage?.getItem(ANALYTICS_CONSENT_STORAGE_KEY) ===
      'granted'
    )
  } catch {
    return false
  }
}

export function normalizeAnalyticsEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function captureWebsiteEvent<
  TEvent extends Extract<WebsiteAnalyticsEventName, 'waitlist_joined'>,
>(
  name: TEvent,
  properties: WebsiteAnalyticsEventPayloadMap[TEvent],
  options?: { email?: string },
): boolean {
  if (!posthog.__loaded || !hasAnalyticsConsent()) {
    return false
  }

  if (options?.email) {
    posthog.identify(normalizeAnalyticsEmail(options.email))
  }

  posthog.capture(name, properties as Record<string, unknown>)
  return true
}

export type CalBookingTrigger = 'BOOKING_CREATED' | 'BOOKING_REQUESTED'

export function mapCalTriggerToEventName(
  trigger: string,
): Extract<WebsiteAnalyticsEventName, 'demo_booked' | 'demo_requested'> | null {
  if (trigger === 'BOOKING_CREATED') return 'demo_booked'
  if (trigger === 'BOOKING_REQUESTED') return 'demo_requested'
  return null
}
