import { ORPCError } from '@orpc/server'
import { generateUUID } from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'
import { z } from 'zod'
import { upsertSessionProgressRecords } from './session-progress-data.ts'
import { ownedSessionWhere } from './caller-scope.ts'

const SessionProgressUpsertSchema = z.object({
  patientSessionId: z.string(),
  sessionExerciseId: z.string(),
  value: z.string(),
})

const upsertPatientSessionData = authed
  .route({ path: '/patient-session-data/upsert-many', method: 'PUT' })
  .input(z.array(SessionProgressUpsertSchema))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context

    // Every record must name an exercise row of one of the caller's sessions.
    const exerciseIds = [...new Set(input.map((r) => r.sessionExerciseId))]
    const exercises = await prisma.sessionExercise.findMany({
      where: {
        id: { in: exerciseIds },
        patientSession: ownedSessionWhere(user.id),
      },
      select: { id: true, patientSessionId: true },
    })
    const sessionOf = new Map(exercises.map((e) => [e.id, e.patientSessionId]))
    const foreign = input.some(
      (record) =>
        sessionOf.get(record.sessionExerciseId) !== record.patientSessionId,
    )
    if (foreign) {
      throw new ORPCError('NOT_FOUND', {
        message: 'Patient session not found',
      })
    }

    await upsertSessionProgressRecords(prisma, input, generateUUID)
  })

export const patientSessionData = {
  upsertMany: upsertPatientSessionData,
}
