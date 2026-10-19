/** Equipment options available before their first exercise is published. */
export const DEFAULT_EXERCISE_EQUIPMENT_KEYS = ['rope', 'small_ball'] as const

/**
 * Maps nullable exercise `item` values to a canonical equipment filter key.
 * Null, undefined, and whitespace-only strings are treated as bodyweight.
 */
export function normalizeExerciseEquipmentKey(
  item: string | null | undefined,
): string {
  if (item == null) return 'bodyweight'
  const trimmed = item.trim()
  if (trimmed === '') return 'bodyweight'
  return trimmed.toLowerCase()
}
