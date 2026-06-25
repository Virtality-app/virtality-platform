import type { Exercise } from '@virtality/db'

export const STANDARD_PROGRAM_EXERCISE_SETTINGS = {
  sets: 3,
  reps: 10,
  restTime: 5,
  holdTime: 1,
  speed: 1.0,
} as const

export type StarterTemplateExerciseRow = {
  exerciseId: string
  position: number
  sets: number
  reps: number
  restTime: number
  holdTime: number
  speed: number
}

export type ExerciseCatalogRow = Pick<
  Exercise,
  'id' | 'displayName' | 'direction' | 'enabled'
>

export type StarterTemplatePreviewExercise = Pick<
  Exercise,
  'id' | 'displayName' | 'direction' | 'enabled' | 'image' | 'video'
>

export type StarterTemplateEditorExercise = {
  id: string
  exerciseId: string
  exercise: Exercise
} & typeof STANDARD_PROGRAM_EXERCISE_SETTINGS

export type StarterTemplateCatalogSelection = {
  /** Program Exercise rows seeded for catalog-first authoring. */
  selectedExercises: StarterTemplateEditorExercise[]
  /** Catalog variant selection keyed by Exercise Variant id (`exerciseId`). */
  isSelected: Record<string, boolean>
}

export function sortStarterTemplateExercises<T extends { position: number }>(
  exercises: readonly T[],
): T[] {
  return [...exercises].sort((a, b) => a.position - b.position)
}

function resolveStarterTemplateCatalogExercises<
  T extends { id: string; enabled: boolean },
>(
  templateExercises: readonly StarterTemplateExerciseRow[],
  catalog: readonly T[],
): T[] {
  const catalogById = new Map(
    catalog.map((exercise) => [exercise.id, exercise]),
  )

  return sortStarterTemplateExercises(templateExercises)
    .map((row) => catalogById.get(row.exerciseId))
    .filter(
      (exercise): exercise is T => exercise !== undefined && exercise.enabled,
    )
}

export function starterTemplateExercisesForPreview(
  templateExercises: readonly StarterTemplateExerciseRow[],
  catalog: readonly StarterTemplatePreviewExercise[],
): StarterTemplatePreviewExercise[] {
  return resolveStarterTemplateCatalogExercises(templateExercises, catalog)
}

export function starterTemplateExerciseNamesForPreview(
  templateExercises: readonly StarterTemplateExerciseRow[],
  catalog: readonly ExerciseCatalogRow[],
): string[] {
  return resolveStarterTemplateCatalogExercises(templateExercises, catalog).map(
    (exercise) => exercise.displayName,
  )
}

function variantSelectionFromEditorExercises(
  selectedExercises: readonly StarterTemplateEditorExercise[],
): StarterTemplateCatalogSelection['isSelected'] {
  return Object.fromEntries(
    selectedExercises.map((row) => [row.exerciseId, true]),
  )
}

export function starterTemplateExercisesForEditor(
  templateExercises: readonly StarterTemplateExerciseRow[],
  catalog: readonly Exercise[],
  generateId: () => string,
): StarterTemplateEditorExercise[] {
  return resolveStarterTemplateCatalogExercises(templateExercises, catalog).map(
    (exercise) => ({
      id: generateId(),
      exerciseId: exercise.id,
      exercise,
      ...STANDARD_PROGRAM_EXERCISE_SETTINGS,
    }),
  )
}

export function starterTemplateCatalogSelection(
  templateExercises: readonly StarterTemplateExerciseRow[],
  catalog: readonly Exercise[],
  generateId: () => string,
): StarterTemplateCatalogSelection {
  const selectedExercises = starterTemplateExercisesForEditor(
    templateExercises,
    catalog,
    generateId,
  )

  return {
    selectedExercises,
    isSelected: variantSelectionFromEditorExercises(selectedExercises),
  }
}

export function suggestedProgramNameFromTemplate(templateName: string): string {
  return templateName.trim()
}
