import { differenceInYears } from 'date-fns'

/** Whole years from date of birth; null when the date is missing or invalid. */
export function ageFromDob(
  dob: string | Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!dob) return null
  const date = new Date(dob)
  if (Number.isNaN(date.getTime())) return null
  const age = differenceInYears(now, date)
  return age >= 0 ? age : null
}

type VisitedSession = {
  createdAt: string | Date
  completedAt?: string | Date | null
}

/** The most recent session date (completion, or start when unfinished). */
export function lastVisit(sessions: readonly VisitedSession[]): Date | null {
  let latest: Date | null = null
  for (const session of sessions) {
    const at = new Date(session.completedAt ?? session.createdAt)
    if (Number.isNaN(at.getTime())) continue
    if (!latest || at > latest) latest = at
  }
  return latest
}
