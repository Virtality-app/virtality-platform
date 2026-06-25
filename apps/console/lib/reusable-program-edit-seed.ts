import type { Exercise } from '@virtality/db'
import type { CompleteExercise } from '@/types/models'
import type { ReusableProgramExerciseVariant } from './program-library-submit'
import { sortStarterTemplateExercises } from './starter-template-create'

export type ExistingProgramExerciseRow = ReusableProgramExerciseVariant & {
  position: number
}

export type ExistingProgramEditMetadata = {
  programId: string
  name: string
}

export function reusableProgramMetadataForEdit(program: {
  id: string
  name: string
}): ExistingProgramEditMetadata {
  return {
    programId: program.id,
    name: program.name.trim(),
  }
}

export function reusableProgramExercisesForCatalogSeed(
  programExercises: readonly ExistingProgramExerciseRow[],
  catalog: readonly Exercise[],
): Omit<CompleteExercise, 'romMode'>[] {
  const catalogById = new Map(
    catalog.map((exercise) => [exercise.id, exercise]),
  )

  return sortStarterTemplateExercises(programExercises).flatMap((row) => {
    const exercise = catalogById.get(row.exerciseId)
    if (!exercise?.enabled) return []

    return [
      {
        id: row.id,
        exerciseId: row.exerciseId,
        sets: row.sets,
        reps: row.reps,
        restTime: row.restTime,
        holdTime: row.holdTime,
        speed: row.speed,
        exercise,
      },
    ]
  })
}

/** Exercise Variant ids used by catalog `isSelected` state after seeding. */
export function catalogSelectionExerciseIds(
  seeded: readonly Pick<CompleteExercise, 'exerciseId'>[],
): string[] {
  return seeded.map((row) => row.exerciseId)
}
