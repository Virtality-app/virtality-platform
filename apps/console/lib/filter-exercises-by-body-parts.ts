type WithCategory = { category: string }

/**
 * Body-part filter: OR within selection. Empty selection shows all exercises.
 */
export function filterExercisesByBodyParts<T extends WithCategory>(
  exercises: T[],
  selectedBodyParts: string[],
): T[] {
  if (selectedBodyParts.length === 0) return exercises
  const set = new Set(selectedBodyParts)
  return exercises.filter((e) => set.has(e.category))
}
