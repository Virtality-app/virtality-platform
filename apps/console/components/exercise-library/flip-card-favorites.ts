import { Exercise } from '@virtality/db'

export type FavoriteTargetRow = {
  exerciseId: string
  favoriteRowId: string | null
}

export function resolveFavoriteTargets(
  exercise: Exercise,
  favoriteExerciseId: string | null | undefined,
  familyFavoriteTargets: FavoriteTargetRow[] | undefined,
): FavoriteTargetRow[] {
  if (familyFavoriteTargets && familyFavoriteTargets.length > 0) {
    return familyFavoriteTargets
  }
  return [
    {
      exerciseId: exercise.id,
      favoriteRowId: favoriteExerciseId ?? null,
    },
  ]
}
