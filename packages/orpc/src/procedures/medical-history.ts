import { MedicalHistoryFindFirstZodSchema } from '@virtality/db/definitions'
import { authed } from '../middleware/auth.ts'

const findMedicalHistory = authed
  .route({ path: '/medicalHistory/:id', method: 'GET' })
  .input(MedicalHistoryFindFirstZodSchema)
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    const medicalHistory = await prisma.medicalHistory.findFirst({
      where: {
        patientId: input?.where?.patientId,
        patient: { userId: user.id },
      },
      take: input?.take,
      skip: input?.skip,
      cursor: input?.cursor,
      orderBy: input?.orderBy,
      select: input?.select,
    })
    return medicalHistory
  })

// Created and updated with its patient, through `patient.create` and
// `patient.update`.
export const medicalHistory = {
  find: findMedicalHistory,
}
