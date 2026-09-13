import { parseBooleanFlag } from '@/lib/env-flag'

/**
 * Whether the VR Experiences sidebar link is shown. Defaults to on;
 * `NEXT_PUBLIC_VR_EXPERIENCES_NAV_ENABLED=false` hides it. The route itself
 * stays reachable either way. Inlined at build time.
 */
export function resolveVrExperiencesNavEnabled(
  flag: string | undefined = process.env.NEXT_PUBLIC_VR_EXPERIENCES_NAV_ENABLED,
): boolean {
  return parseBooleanFlag(flag) ?? true
}
