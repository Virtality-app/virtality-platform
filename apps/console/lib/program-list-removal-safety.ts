import type { ProgramExerciseListSegment } from '@virtality/shared/utils'
import type { CompleteExercise } from '@/types/models'
import { programExerciseFieldsDiverge } from './program-exercise-pair-fields'

/**
 * Selected-program removal should confirm when a divergent bilateral pair
 * would lose side-specific work (PRD #5 stage-aware removal, GitHub #10).
 */
export function removalDiscardsDivergentBilateralWork(
  selectedExercises: readonly CompleteExercise[],
  segments: readonly ProgramExerciseListSegment[],
  idsToRemove: ReadonlySet<string>,
): boolean {
  for (const seg of segments) {
    if (seg.kind !== 'bilateral') continue
    const a = selectedExercises[seg.startIndex]!
    const b = selectedExercises[seg.startIndex + 1]!
    if (!programExerciseFieldsDiverge(a, b)) continue
    if (idsToRemove.has(a.id) || idsToRemove.has(b.id)) return true
  }
  return false
}
