import { PatientSessionSchema } from '@virtality/shared/types'
import { authed } from '../middleware/auth.ts'
import { PatientSessionSupplementalTherapyRel } from '@virtality/db'
import { z } from 'zod'
import { generateUUID } from '@virtality/shared/utils'
import { requireOwnedSession } from './caller-scope.ts'

const listSupplementalTherapies = authed
  .route({ path: '/supplemental-therapy/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context
    const supplementalTherapies = await prisma.supplementalTherapy.findMany()
    return supplementalTherapies
  })

const createSupplementalTherapyRel = authed
  .route({ path: '/supplemental-therapy/create-rel', method: 'POST' })
  .input(PatientSessionSchema.extend({ patientSessionId: z.string() }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    const { patientSessionId, otherEnabled, otherText: otherLabel } = input
    await requireOwnedSession(prisma, user.id, patientSessionId)
    const data: PatientSessionSupplementalTherapyRel[] = []
    input.methods.forEach((supplementalTherapyId) =>
      data.push({
        id: generateUUID(),
        patientSessionId,
        supplementalTherapyId,
        otherLabel: null,
      }),
    )

    if (otherEnabled && otherLabel) {
      data.push({
        id: generateUUID(),
        patientSessionId,
        supplementalTherapyId: null,
        otherLabel,
      })
    }

    await prisma.patientSessionSupplementalTherapyRel.createMany({ data })
  })

export const supplementalTherapy = {
  list: listSupplementalTherapies,
  createRel: createSupplementalTherapyRel,
}
