const ONE_DAY_MS = 24 * 60 * 60 * 1000

export const MIN_WINDOW_DAYS = 3

export type DashboardWindowInput = {
  from: Date
  to: Date
  /** Ignore `from` and start at the first session on record. */
  allTime: boolean
}

export type DashboardWindow = {
  from: Date
  to: Date
  toExclusive: Date
}

export const getUTCDayStart = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )

export const toISODate = (date: Date): string => date.toISOString().slice(0, 10)

/** Why a requested window is invalid, or `null` when it is fine. */
export function validateDashboardWindow(
  input: DashboardWindowInput,
): { path: 'from' | 'to'; message: string } | null {
  if (input.allTime) return null
  const from = getUTCDayStart(input.from).getTime()
  const to = getUTCDayStart(input.to).getTime()
  if (from > to)
    return { path: 'to', message: '"to" must be on or after "from".' }
  if ((to - from) / ONE_DAY_MS + 1 < MIN_WINDOW_DAYS) {
    return {
      path: 'from',
      message: `Date window must be at least ${MIN_WINDOW_DAYS} days.`,
    }
  }
  return null
}

/**
 * Inclusive UTC days for a dashboard query. All Time starts on the day of the
 * first session on record (`firstSessionAt`), or on `to` when there is none.
 */
export function resolveDashboardWindow(
  input: DashboardWindowInput,
  firstSessionAt: Date | null,
): DashboardWindow {
  const to = getUTCDayStart(input.to)
  const requestedFrom = input.allTime ? (firstSessionAt ?? to) : input.from
  const from = getUTCDayStart(requestedFrom)
  return {
    from: from.getTime() > to.getTime() ? to : from,
    to,
    toExclusive: new Date(to.getTime() + ONE_DAY_MS),
  }
}
