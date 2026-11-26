import { ORPCError } from '@orpc/server'
import type { PrismaClient } from '@virtality/db'

/**
 * Signing in proves who the caller is, not which records they may touch. A
 * console procedure that takes a record id looks it up through the caller's
 * ownership, never by the bare id: a Patient by `userId`, and everything
 * under a patient (sessions, medical history, progress) by
 * `patient: { userId }`. Another clinician's id gets NOT_FOUND, the same
 * answer as an id that doesn't exist, so the response doesn't reveal which
 * ids exist.
 */

export function ownedSessionWhere(userId: string) {
  return { patient: { userId } }
}

export async function requireOwnedPatient(
  prisma: Pick<PrismaClient, 'patient'>,
  userId: string,
  patientId: string,
): Promise<void> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId },
    select: { id: true },
  })
  if (!patient) {
    throw new ORPCError('NOT_FOUND', { message: 'Patient not found' })
  }
}

export async function requireOwnedSessions(
  prisma: Pick<PrismaClient, 'patientSession'>,
  userId: string,
  sessionIds: string[],
): Promise<void> {
  const ids = [...new Set(sessionIds)]
  if (ids.length === 0) return

  const owned = await prisma.patientSession.findMany({
    where: { id: { in: ids }, ...ownedSessionWhere(userId) },
    select: { id: true },
  })
  if (owned.length !== ids.length) {
    throw new ORPCError('NOT_FOUND', { message: 'Patient session not found' })
  }
}

export function requireOwnedSession(
  prisma: Pick<PrismaClient, 'patientSession'>,
  userId: string,
  sessionId: string,
): Promise<void> {
  return requireOwnedSessions(prisma, userId, [sessionId])
}
