import { describe, expect, it } from 'vitest'
import { DEMO_BOOKING_URL_ENV, getDemoBookingUrl } from './demo-booking'

describe('demo booking URL', () => {
  it('resolves from one public environment variable', () => {
    expect(DEMO_BOOKING_URL_ENV).toBe('NEXT_PUBLIC_DEMO_BOOKING_URL')
    expect(
      getDemoBookingUrl({
        NEXT_PUBLIC_DEMO_BOOKING_URL: 'https://cal.com/virtality',
      }),
    ).toBe('https://cal.com/virtality')
    expect(() => getDemoBookingUrl({})).toThrow(
      'NEXT_PUBLIC_DEMO_BOOKING_URL is not set',
    )
  })
})
