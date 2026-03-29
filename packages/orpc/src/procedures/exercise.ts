import { z } from 'zod/v4'
import { authed } from '../middleware/auth.ts'
import { ExerciseFindManyZodSchema } from '@virtality/db/definitions'

const listExercise = authed
  .route({ path: '/exercise/list', method: 'GET' })
  .input(
    ExerciseFindManyZodSchema.extend({
      includeDisabled: z.boolean().optional(),
    }),
  )
  .handler(async ({ context, input }) => {
    const { prisma } = context

    const { includeDisabled, orderBy, where } = input

    return prisma.exercise.findMany({
      where: { ...where, ...(!includeDisabled && { enabled: true }) },
      orderBy,
    })
  })

export const exercise = {
  list: listExercise,
}
