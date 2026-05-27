import { describe, expect, it } from 'vitest'
import { removalDiscardsDivergentBilateralWork } from './program-list-removal-safety.ts'
import type { CompleteExercise } from '@/types/models'
import type { ProgramExerciseListSegment } from '@virtality/shared/utils'

function ex(
  id: string,
  partial: Partial<CompleteExercise> = {},
): CompleteExercise {
  return {
    id,
    exerciseId: `ex-${id}`,
    reps: 10,
    sets: 3,
    restTime: 5,
    holdTime: 1,
    speed: 1,
    romMode: 0,
    ...partial,
  }
}

describe('removalDiscardsDivergentBilateralWork', () => {
  const bilateral: ProgramExerciseListSegment[] = [
    { kind: 'bilateral', startIndex: 0 },
  ]

  it('is false when no bilateral segment diverges', () => {
    const list = [ex('l'), ex('r')]
    const remove = new Set<string>(['l'])
    expect(removalDiscardsDivergentBilateralWork(list, bilateral, remove)).toBe(
      false,
    )
  })

  it('is true when a divergent bilateral member is removed', () => {
    const list = [ex('l'), ex('r', { reps: 99 })]
    const remove = new Set<string>(['l'])
    expect(removalDiscardsDivergentBilateralWork(list, bilateral, remove)).toBe(
      true,
    )
  })

  it('is false when removing unrelated singles only', () => {
    const list = [ex('a'), ex('b')]
    const segs: ProgramExerciseListSegment[] = [
      { kind: 'single', startIndex: 0 },
      { kind: 'single', startIndex: 1 },
    ]
    expect(
      removalDiscardsDivergentBilateralWork(list, segs, new Set(['a'])),
    ).toBe(false)
  })
})
