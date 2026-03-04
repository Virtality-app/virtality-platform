import { CompleteExercise } from '@/types/models'

/**
 *
 * @param exercises - The exercises to add ROM mode to
 * @returns The exercises with ROM mode added
 */
export function withRom(
  exercises: Omit<CompleteExercise, 'romMode'>,
): CompleteExercise
export function withRom(
  exercises: Omit<CompleteExercise, 'romMode'>[],
): CompleteExercise[]
export function withRom(
  exercises:
    | Omit<CompleteExercise, 'romMode'>[]
    | Omit<CompleteExercise, 'romMode'>,
): CompleteExercise | CompleteExercise[] {
  if (!Array.isArray(exercises)) {
    return {
      ...exercises,
      romMode: 1 as const,
    }
  }

  return exercises.map((exercise) => ({
    ...exercise,
    romMode: 1 as const,
  }))
}
