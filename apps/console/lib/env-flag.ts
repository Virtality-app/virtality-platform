/**
 * Parse a `true`/`false` (or `1`/`0`) build-time flag. Anything else,
 * including unset, is `undefined` so callers can fall back to a default.
 */
export function parseBooleanFlag(
  value: string | undefined,
): boolean | undefined {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'true' || normalized === '1') return true
  if (normalized === 'false' || normalized === '0') return false
  return undefined
}
