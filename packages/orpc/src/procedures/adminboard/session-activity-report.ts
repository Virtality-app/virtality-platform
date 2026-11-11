import { UNKNOWN_OWNER_ID, UNKNOWN_OWNER_LABEL } from './analytics-filters.ts'
import {
  SESSION_TYPES,
  emptyTypeCounts,
  getSessionTiming,
  mapTypeCounts,
  type SessionType,
  type SessionTypeCounts,
} from './session-type.ts'

export type SessionActivityGranularity = 'day' | 'week'

export type ActivityPatientRow = {
  id: string
  name: string
  userId: string | null
}

export type ActivitySessionRow = {
  patientId: string
  createdAt: string
  /** End time when one was recorded; sessions without one still count. */
  completedAt: string | null
  /** Set when the clinician pressed Don't Save; the session still counts. */
  deletedAt: string | null
  videoMinutes: number | null
}

export type SessionActivityInput = {
  from: string
  to: string
  granularity: SessionActivityGranularity
  patients: ActivityPatientRow[]
  /**
   * Sessions that started in the window, including Don't Save ones, whatever
   * their status: session status is not reliable, so it is never used.
   */
  sessions: ActivitySessionRow[]
  userNamesById: Record<string, string | null | undefined>
}

type TypeAverages = Record<SessionType, number | null>

export type SessionActivityTrendPoint = {
  bucketStart: string
  sessionsByType: SessionTypeCounts
  minutesByType: SessionTypeCounts
  averageMinutesByType: TypeAverages
  /** Sessions keyed by owner id (`UNKNOWN_OWNER_ID` for none). */
  sessionsByUser: Record<string, number>
}

export type SessionLengthBucket = {
  key: string
  label: string
  sessionsByType: SessionTypeCounts
}

export type ClinicianActivity = {
  userId: string
  userLabel: string
  totalPatients: number
  activePatients: number
  vrPatients: number
  sessionCount: number
  sessionsByType: SessionTypeCounts
  totalMinutes: number
  minutesByType: SessionTypeCounts
  averageMinutes: number | null
  lastSessionAt: string | null
}

export type PatientActivity = {
  patientId: string
  patientName: string
  userLabel: string
  sessionCount: number
  sessionsByType: SessionTypeCounts
  totalMinutes: number
  lastSessionAt: string | null
}

export type SessionActivityReport = {
  from: string
  to: string
  granularity: SessionActivityGranularity
  summary: {
    sessionCount: number
    /** Of `sessionCount`, how many lasted under `SHORT_SESSION_MINUTES`. */
    shortSessionCount: number
    sessionsByType: SessionTypeCounts
    totalMinutes: number
    minutesByType: SessionTypeCounts
    averageMinutes: number | null
    averageMinutesByType: TypeAverages
    sessionsWithDuration: number
    totalPatients: number
    activePatients: number
    averageSessionsPerActivePatient: number | null
  }
  trend: SessionActivityTrendPoint[]
  lengthBuckets: SessionLengthBucket[]
  clinicians: ClinicianActivity[]
  patients: PatientActivity[]
  /** Active patients by the kinds of session they had in the window. */
  patientMix: { exerciseOnly: number; vrOnly: number; exerciseAndVr: number }
}

const LENGTH_BUCKETS = [
  { key: 'lt10', label: '<10 min', max: 10 },
  { key: '10-20', label: '10–20', max: 20 },
  { key: '20-30', label: '20–30', max: 30 },
  { key: '30-45', label: '30–45', max: 45 },
  { key: '45-60', label: '45–60', max: 60 },
  { key: '60+', label: '60+', max: Number.POSITIVE_INFINITY },
] as const

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** Sessions shorter than this are likely false starts, not real treatment. */
export const SHORT_SESSION_MINUTES = 5

const roundOneDecimal = (value: number): number => Math.round(value * 10) / 10

const toAverage = (total: number, count: number): number | null =>
  count === 0 ? null : roundOneDecimal(total / count)

const toISODate = (date: Date): string => date.toISOString().slice(0, 10)

const parseISODate = (value: string): Date => new Date(`${value}T00:00:00.000Z`)

const getISOWeekStartUTC = (date: Date): Date => {
  const dayStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  )
  const dayOfWeek = dayStart.getUTCDay() || 7
  dayStart.setUTCDate(dayStart.getUTCDate() - dayOfWeek + 1)
  return dayStart
}

const getBucketKey = (
  date: Date,
  granularity: SessionActivityGranularity,
): string => toISODate(granularity === 'day' ? date : getISOWeekStartUTC(date))

export function buildBucketKeys(
  from: string,
  to: string,
  granularity: SessionActivityGranularity,
): string[] {
  const step = granularity === 'day' ? ONE_DAY_MS : 7 * ONE_DAY_MS
  const start = parseISODate(getBucketKey(parseISODate(from), granularity))
  const end = parseISODate(to).getTime()
  const keys: string[] = []
  for (let time = start.getTime(); time <= end; time += step) {
    keys.push(toISODate(new Date(time)))
  }
  return keys
}

const ownerKey = (userId: string | null): string => userId ?? UNKNOWN_OWNER_ID

const sumCounts = (counts: SessionTypeCounts): number =>
  SESSION_TYPES.reduce((sum, type) => sum + counts[type], 0)

const roundCounts = (counts: SessionTypeCounts): SessionTypeCounts =>
  mapTypeCounts((type) => roundOneDecimal(counts[type]))

type Tally = {
  sessionsByType: SessionTypeCounts
  minutesByType: SessionTypeCounts
  timedByType: SessionTypeCounts
  lastSessionAt: string | null
}

const emptyTally = (): Tally => ({
  sessionsByType: emptyTypeCounts(),
  minutesByType: emptyTypeCounts(),
  timedByType: emptyTypeCounts(),
  lastSessionAt: null,
})

const addToTally = (
  tally: Tally,
  type: SessionType,
  minutes: number | null,
  startedAt: string,
) => {
  tally.sessionsByType[type] += 1
  if (minutes !== null) {
    tally.minutesByType[type] += minutes
    tally.timedByType[type] += 1
  }
  if (!tally.lastSessionAt || startedAt > tally.lastSessionAt) {
    tally.lastSessionAt = startedAt
  }
}

const averagesByType = (tally: Tally): TypeAverages =>
  mapTypeCounts((type) =>
    toAverage(tally.minutesByType[type], tally.timedByType[type]),
  )

export function buildSessionActivityReport(
  input: SessionActivityInput,
): SessionActivityReport {
  const patientsById = new Map(input.patients.map((p) => [p.id, p]))
  const userLabel = (userId: string | null): string =>
    userId === null
      ? UNKNOWN_OWNER_LABEL
      : input.userNamesById[userId] || UNKNOWN_OWNER_LABEL

  const overall = emptyTally()
  let shortSessionCount = 0
  const byBucket = new Map<string, Tally & { byUser: Record<string, number> }>()
  for (const key of buildBucketKeys(input.from, input.to, input.granularity)) {
    byBucket.set(key, { ...emptyTally(), byUser: {} })
  }
  const byUser = new Map<string, Tally>()
  const byPatient = new Map<string, Tally>()
  const lengthCounts = LENGTH_BUCKETS.map(() => emptyTypeCounts())

  for (const session of input.sessions) {
    const patient = patientsById.get(session.patientId)
    if (!patient) continue

    const timing = getSessionTiming(session)
    const minutes = timing.totalMinutes
    const owner = ownerKey(patient.userId)

    addToTally(overall, timing.type, minutes, session.createdAt)
    if (minutes !== null && minutes < SHORT_SESSION_MINUTES) {
      shortSessionCount += 1
    }

    const bucketKey = getBucketKey(
      new Date(session.createdAt),
      input.granularity,
    )
    const bucket = byBucket.get(bucketKey) ?? { ...emptyTally(), byUser: {} }
    addToTally(bucket, timing.type, minutes, session.createdAt)
    bucket.byUser[owner] = (bucket.byUser[owner] ?? 0) + 1
    byBucket.set(bucketKey, bucket)

    const userTally = byUser.get(owner) ?? emptyTally()
    addToTally(userTally, timing.type, minutes, session.createdAt)
    byUser.set(owner, userTally)

    const patientTally = byPatient.get(patient.id) ?? emptyTally()
    addToTally(patientTally, timing.type, minutes, session.createdAt)
    byPatient.set(patient.id, patientTally)

    if (minutes !== null) {
      const index = LENGTH_BUCKETS.findIndex((b) => minutes < b.max)
      lengthCounts[index]![timing.type] += 1
    }
  }

  const usedVideo = (tally: Tally) => tally.sessionsByType.vr > 0
  const usedExercise = (tally: Tally) => tally.sessionsByType.exercise > 0

  const patientMix = { exerciseOnly: 0, vrOnly: 0, exerciseAndVr: 0 }
  for (const tally of byPatient.values()) {
    if (usedVideo(tally) && usedExercise(tally)) patientMix.exerciseAndVr += 1
    else if (usedVideo(tally)) patientMix.vrOnly += 1
    else patientMix.exerciseOnly += 1
  }

  const ownerKeys = new Set(input.patients.map((p) => ownerKey(p.userId)))
  const clinicians: ClinicianActivity[] = [...ownerKeys].map((key) => {
    const owned = input.patients.filter((p) => ownerKey(p.userId) === key)
    const active = owned.filter((p) => byPatient.has(p.id))
    const tally = byUser.get(key) ?? emptyTally()
    const totalMinutes = sumCounts(tally.minutesByType)
    return {
      userId: key,
      userLabel: userLabel(key === UNKNOWN_OWNER_ID ? null : key),
      totalPatients: owned.length,
      activePatients: active.length,
      vrPatients: active.filter((p) => usedVideo(byPatient.get(p.id)!)).length,
      sessionCount: sumCounts(tally.sessionsByType),
      sessionsByType: tally.sessionsByType,
      totalMinutes: roundOneDecimal(totalMinutes),
      minutesByType: roundCounts(tally.minutesByType),
      averageMinutes: toAverage(totalMinutes, sumCounts(tally.timedByType)),
      lastSessionAt: tally.lastSessionAt,
    }
  })
  clinicians.sort(
    (a, b) =>
      b.sessionCount - a.sessionCount ||
      b.totalPatients - a.totalPatients ||
      a.userLabel.localeCompare(b.userLabel),
  )

  const patients: PatientActivity[] = [...byPatient.entries()].map(
    ([patientId, tally]) => {
      const patient = patientsById.get(patientId)!
      return {
        patientId,
        patientName: patient.name,
        userLabel: userLabel(patient.userId),
        sessionCount: sumCounts(tally.sessionsByType),
        sessionsByType: tally.sessionsByType,
        totalMinutes: roundOneDecimal(sumCounts(tally.minutesByType)),
        lastSessionAt: tally.lastSessionAt,
      }
    },
  )
  patients.sort(
    (a, b) =>
      b.sessionCount - a.sessionCount ||
      a.patientName.localeCompare(b.patientName),
  )

  const sessionCount = sumCounts(overall.sessionsByType)
  const totalMinutes = sumCounts(overall.minutesByType)
  const sessionsWithDuration = sumCounts(overall.timedByType)

  return {
    from: input.from,
    to: input.to,
    granularity: input.granularity,
    summary: {
      sessionCount,
      shortSessionCount,
      sessionsByType: overall.sessionsByType,
      totalMinutes: roundOneDecimal(totalMinutes),
      minutesByType: roundCounts(overall.minutesByType),
      averageMinutes: toAverage(totalMinutes, sessionsWithDuration),
      averageMinutesByType: averagesByType(overall),
      sessionsWithDuration,
      totalPatients: input.patients.length,
      activePatients: byPatient.size,
      averageSessionsPerActivePatient: toAverage(sessionCount, byPatient.size),
    },
    trend: [...byBucket.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bucketStart, tally]) => ({
        bucketStart,
        sessionsByType: tally.sessionsByType,
        minutesByType: roundCounts(tally.minutesByType),
        averageMinutesByType: averagesByType(tally),
        sessionsByUser: tally.byUser,
      })),
    lengthBuckets: LENGTH_BUCKETS.map((bucket, index) => ({
      key: bucket.key,
      label: bucket.label,
      sessionsByType: lengthCounts[index]!,
    })),
    clinicians,
    patients,
    patientMix,
  }
}
