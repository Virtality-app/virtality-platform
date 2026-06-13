import { UNKNOWN_OWNER_ID, UNKNOWN_OWNER_LABEL } from './analytics-filters.ts'

export type EffectivenessPatientRow = {
  id: string
  userId: string | null
}

export type EffectivenessSessionRow = {
  patientId: string
}

export type EffectivenessUserMetrics = {
  userId: string
  userLabel: string
  totalPatients: number
  activePatients: number
  patientActivationRatePercent: number | null
  completedSessions: number
  averageSessionsPerActivePatient: number | null
}

export type EffectivenessReportSummary = {
  totalPatients: number
  activePatients: number
  patientActivationRatePercent: number | null
  completedSessions: number
  averageSessionsPerActivePatient: number | null
}

export type EffectivenessReportResult = {
  summary: EffectivenessReportSummary
  byUser: EffectivenessUserMetrics[]
  hasSessionActivity: boolean
}

const normalizeOwnerId = (userId: string | null): string =>
  userId ?? UNKNOWN_OWNER_ID

const toRatePercent = (
  numerator: number,
  denominator: number,
): number | null => {
  if (denominator === 0) {
    return null
  }

  return Math.round((numerator / denominator) * 1000) / 10
}

const toAverage = (total: number, count: number): number | null => {
  if (count === 0) {
    return null
  }

  return Math.round((total / count) * 10) / 10
}

const resolveUserLabel = (
  userId: string,
  userNamesById: Record<string, string | null | undefined>,
): string => {
  if (userId === UNKNOWN_OWNER_ID) {
    return UNKNOWN_OWNER_LABEL
  }

  const name = userNamesById[userId]
  if (!name || name.trim().length === 0) {
    return 'Unnamed owner'
  }

  return name
}

const buildUserMetrics = (
  userId: string,
  totalPatients: number,
  activePatientIds: Set<string>,
  completedSessions: number,
  userNamesById: Record<string, string | null | undefined>,
): EffectivenessUserMetrics => {
  const activePatients = activePatientIds.size

  return {
    userId,
    userLabel: resolveUserLabel(userId, userNamesById),
    totalPatients,
    activePatients,
    patientActivationRatePercent: toRatePercent(activePatients, totalPatients),
    completedSessions,
    averageSessionsPerActivePatient: toAverage(
      completedSessions,
      activePatients,
    ),
  }
}

export function buildEffectivenessReport(input: {
  patients: EffectivenessPatientRow[]
  sessions: EffectivenessSessionRow[]
  userNamesById: Record<string, string | null | undefined>
}): EffectivenessReportResult {
  const patientsByOwner = new Map<string, Set<string>>()
  const patientOwnerById = new Map<string, string>()

  input.patients.forEach((patient) => {
    const ownerId = normalizeOwnerId(patient.userId)
    patientOwnerById.set(patient.id, ownerId)

    const ownerPatients = patientsByOwner.get(ownerId) ?? new Set<string>()
    ownerPatients.add(patient.id)
    patientsByOwner.set(ownerId, ownerPatients)
  })

  const activePatientsByOwner = new Map<string, Set<string>>()
  const completedSessionsByOwner = new Map<string, number>()

  input.sessions.forEach((session) => {
    const ownerId = patientOwnerById.get(session.patientId)
    if (!ownerId) {
      return
    }

    const activePatients =
      activePatientsByOwner.get(ownerId) ?? new Set<string>()
    activePatients.add(session.patientId)
    activePatientsByOwner.set(ownerId, activePatients)

    completedSessionsByOwner.set(
      ownerId,
      (completedSessionsByOwner.get(ownerId) ?? 0) + 1,
    )
  })

  const ownerIds = new Set<string>([
    ...patientsByOwner.keys(),
    ...activePatientsByOwner.keys(),
  ])

  const byUser = [...ownerIds]
    .map((userId) =>
      buildUserMetrics(
        userId,
        patientsByOwner.get(userId)?.size ?? 0,
        activePatientsByOwner.get(userId) ?? new Set<string>(),
        completedSessionsByOwner.get(userId) ?? 0,
        input.userNamesById,
      ),
    )
    .sort((left, right) => left.userLabel.localeCompare(right.userLabel))

  const summary = byUser.reduce<EffectivenessReportSummary>(
    (acc, user) => ({
      totalPatients: acc.totalPatients + user.totalPatients,
      activePatients: acc.activePatients + user.activePatients,
      patientActivationRatePercent: null,
      completedSessions: acc.completedSessions + user.completedSessions,
      averageSessionsPerActivePatient: null,
    }),
    {
      totalPatients: 0,
      activePatients: 0,
      patientActivationRatePercent: null,
      completedSessions: 0,
      averageSessionsPerActivePatient: null,
    },
  )

  summary.patientActivationRatePercent = toRatePercent(
    summary.activePatients,
    summary.totalPatients,
  )
  summary.averageSessionsPerActivePatient = toAverage(
    summary.completedSessions,
    summary.activePatients,
  )

  return {
    summary,
    byUser,
    hasSessionActivity: summary.completedSessions > 0,
  }
}
