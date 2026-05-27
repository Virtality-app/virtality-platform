import { describe, expect, it } from 'vitest'
import { segmentProgramExerciseRowsByAdjacentBilateralFamilies } from '@virtality/shared/utils'
import type { CompleteExercise } from '@/types/models'

function mockExercise(
  id: string,
  exerciseId: string,
  displayName: string,
  direction: string,
): CompleteExercise {
  return {
    id,
    exerciseId,
    reps: 10,
    sets: 3,
    restTime: 5,
    holdTime: 1,
    speed: 1,
    romMode: 0,
    exercise: { displayName, direction } as CompleteExercise['exercise'],
  }
}

describe('program list bilateral grouping (authoring list)', () => {
  it('segments adjacent same-displayName left/right as one bilateral group', () => {
    const list: CompleteExercise[] = [
      mockExercise('row-1', 'ex-l', 'Press', 'Left'),
      mockExercise('row-2', 'ex-r', 'Press', 'Right'),
    ]
    const segs = segmentProgramExerciseRowsByAdjacentBilateralFamilies(
      list.map((e) => ({
        displayName: e.exercise?.displayName ?? '',
        direction: e.exercise?.direction ?? '',
      })),
    )
    expect(segs).toEqual([{ kind: 'bilateral', startIndex: 0 }])
  })
})
