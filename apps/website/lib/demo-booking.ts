export const DEMO_BOOKING_URL_ENV = 'NEXT_PUBLIC_DEMO_BOOKING_URL' as const

export function getDemoBookingUrl(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): string {
  const url = env[DEMO_BOOKING_URL_ENV]

  if (!url) {
    throw new Error(`${DEMO_BOOKING_URL_ENV} is not set`)
  }

  return url
}
