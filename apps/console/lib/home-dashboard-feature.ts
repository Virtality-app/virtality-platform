import { parseBooleanFlag } from '@/lib/env-flag'

/**
 * Whether `/` shows the home dashboard (sessions overview, Start a session
 * picker, pinned patients, Getting started) or the original welcome screen.
 * On for every non-production deploy, off on the live site.
 * `NEXT_PUBLIC_HOME_DASHBOARD_ENABLED` overrides that default when set to
 * `true` / `false`. Inlined at build time.
 */
export function resolveHomeDashboardEnabled(
  env: string | undefined = process.env.NEXT_PUBLIC_ENV,
  flag: string | undefined = process.env.NEXT_PUBLIC_HOME_DASHBOARD_ENABLED,
): boolean {
  const override = parseBooleanFlag(flag)
  if (override !== undefined) return override
  return env !== 'production'
}
