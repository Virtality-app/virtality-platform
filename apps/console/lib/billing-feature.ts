/**
 * Billing UI (Profile → Billing tab, Remaining Time sidebar, renew banner)
 * is a preview/local-only feature by default: on for every non-production
 * deploy, off on the live site. `NEXT_PUBLIC_BILLING_FEATURE_ENABLED`
 * overrides that default when set to `true` / `false`, so billing can be
 * switched on in production for testing (or off in preview) without a code
 * change. Both variables are inlined at build time, so server and client
 * agree with no flag round-trip and no hydration mismatch.
 */
export function resolveBillingFeatureEnabled(
  env: string | undefined = process.env.NEXT_PUBLIC_ENV,
  flag: string | undefined = process.env.NEXT_PUBLIC_BILLING_FEATURE_ENABLED,
): boolean {
  const override = parseBooleanFlag(flag)
  if (override !== undefined) return override
  return env !== 'production'
}

function parseBooleanFlag(value: string | undefined): boolean | undefined {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false
  return undefined
}
