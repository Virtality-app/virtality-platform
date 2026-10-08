import type { ColumnFiltersState } from '@tanstack/react-table'

export type ExerciseTableFilters = {
  categories: string[]
  directions: string[]
  onlyNew: boolean
  onlyEnabled: boolean
}

export const EMPTY_EXERCISE_TABLE_FILTERS: ExerciseTableFilters = {
  categories: [],
  directions: [],
  onlyNew: false,
  onlyEnabled: false,
}

/** Distinct, non-empty values of one string field, sorted for a picker. */
export const listExerciseValues = <K extends string>(
  exercises: Record<K, string>[],
  key: K,
): string[] =>
  Array.from(new Set(exercises.map((exercise) => exercise[key].trim())))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

/** Column filters for TanStack: only the active ones are emitted. */
export const buildExerciseColumnFilters = (
  filters: ExerciseTableFilters,
): ColumnFiltersState => [
  ...(filters.categories.length > 0
    ? [{ id: 'category', value: filters.categories }]
    : []),
  ...(filters.directions.length > 0
    ? [{ id: 'direction', value: filters.directions }]
    : []),
  ...(filters.onlyNew ? [{ id: 'isNew', value: true }] : []),
  ...(filters.onlyEnabled ? [{ id: 'enabled', value: true }] : []),
]

export const countActiveExerciseFilters = (
  filters: ExerciseTableFilters,
): number =>
  (filters.categories.length > 0 ? 1 : 0) +
  (filters.directions.length > 0 ? 1 : 0) +
  (filters.onlyNew ? 1 : 0) +
  (filters.onlyEnabled ? 1 : 0)
