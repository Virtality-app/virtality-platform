import type { PrismaClient } from '@virtality/db'
import type { UpdateExerciseFamilyMediaInput } from '@virtality/shared/types'

export class ExerciseFamilyNotFoundError extends Error {
  constructor(displayName: string) {
    super(`No exercise family named "${displayName}".`)
    this.name = 'ExerciseFamilyNotFoundError'
  }
}

/**
 * Writes one image and one video to every row of the Exercise family, so Left
 * and Right rows keep sharing media. The Unity `name` is never touched.
 */
export async function updateExerciseFamilyMedia(
  prisma: Pick<PrismaClient, 'exercise'>,
  input: UpdateExerciseFamilyMediaInput,
): Promise<{ updated: number }> {
  const { count } = await prisma.exercise.updateMany({
    where: { displayName: input.displayName },
    data: { image: input.image, video: input.video },
  })

  if (count === 0) {
    throw new ExerciseFamilyNotFoundError(input.displayName)
  }

  return { updated: count }
}
