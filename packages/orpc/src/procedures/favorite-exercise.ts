import { generateUUID } from '@virtality/shared/utils'
import { authed } from '../middleware/auth.ts'
import { z } from 'zod'

const FavoriteExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
})

const listFavoriteExercise = authed
  .route({ path: '/favorite-exercise/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma, user } = context
    const favoriteExercises = await prisma.favoriteExercise.findMany({
      where: { userId: user.id },
    })
    return favoriteExercises
  })

const addFavoriteExercise = authed
  .route({ path: '/favorite-exercise/add', method: 'POST' })
  .input(FavoriteExerciseSchema.pick({ exerciseId: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    await prisma.favoriteExercise.create({
      data: {
        id: generateUUID(),
        exerciseId: input.exerciseId,
        userId: user.id,
      },
    })
  })

const removeFavoriteExercise = authed
  .route({ path: '/favorite-exercise/remove', method: 'POST' })
  .input(FavoriteExerciseSchema.pick({ id: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    await prisma.favoriteExercise.delete({
      where: { id: input.id, userId: user.id },
    })
  })

export const favoriteExercise = {
  list: listFavoriteExercise,
  add: addFavoriteExercise,
  remove: removeFavoriteExercise,
}
