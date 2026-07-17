export const DEMO_BOOKING_URL_ENV = 'NEXT_PUBLIC_DEMO_BOOKING_URL' as const

export function getDemoBookingUrl(
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>,
): string {
  // Next.js only inlines NEXT_PUBLIC_* values when accessed as a static
  // `process.env.NEXT_PUBLIC_*` property. Dynamic `env[name]` lookup is
  // invisible to the client bundler, so the default path must be static.
  const url = env
    ? env[DEMO_BOOKING_URL_ENV]
    : process.env.NEXT_PUBLIC_DEMO_BOOKING_URL

  if (!url) {
    throw new Error(`${DEMO_BOOKING_URL_ENV} is not set`)
  }

  return url
}
