import { describe, expect, it, vi } from 'vitest'
import {
  ExerciseFamilyNotFoundError,
  updateExerciseFamilyMedia,
} from './exercise-family-media-service.ts'

function prismaWithUpdatedCount(count: number) {
  return {
    exercise: {
      updateMany: vi.fn(async () => ({ count })),
    },
  }
}

describe('updateExerciseFamilyMedia', () => {
  it('writes image and video to every row sharing the displayName', async () => {
    const prisma = prismaWithUpdatedCount(2)

    const result = await updateExerciseFamilyMedia(prisma as never, {
      displayName: 'External Rotation Rope Stretch',
      image: 'https://cdn.example/exercises/thumbnail/a.png',
      video: 'https://cdn.example/exercises/a.mp4',
    })

    expect(result).toEqual({ updated: 2 })
    expect(prisma.exercise.updateMany).toHaveBeenCalledWith({
      where: { displayName: 'External Rotation Rope Stretch' },
      data: {
        image: 'https://cdn.example/exercises/thumbnail/a.png',
        video: 'https://cdn.example/exercises/a.mp4',
      },
    })
  })

  it('clears media when given null', async () => {
    const prisma = prismaWithUpdatedCount(1)

    await updateExerciseFamilyMedia(prisma as never, {
      displayName: 'Squat',
      image: null,
      video: null,
    })

    expect(prisma.exercise.updateMany).toHaveBeenCalledWith({
      where: { displayName: 'Squat' },
      data: { image: null, video: null },
    })
  })

  it('rejects a displayName that matches no exercise', async () => {
    const prisma = prismaWithUpdatedCount(0)

    await expect(
      updateExerciseFamilyMedia(prisma as never, {
        displayName: 'Missing',
        image: null,
        video: null,
      }),
    ).rejects.toBeInstanceOf(ExerciseFamilyNotFoundError)
  })
})
