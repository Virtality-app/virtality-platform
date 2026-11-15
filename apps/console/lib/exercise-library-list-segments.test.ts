import { describe, expect, it } from 'vitest'
import type { Exercise } from '@virtality/db'
import type { CompleteExercise } from '@/types/models'
import { describeSegment } from '@/components/exercise-library/exercise-library-list-segments'

const catalogExercise = (id: string, direction: string) =>
  ({ id, displayName: 'Arm raise', direction }) as Exercise

const member = (id: string, direction: string): CompleteExercise => ({
  id,
  exerciseId: `ex-${id}`,
  sets: 1,
  reps: 1,
  restTime: 0,
  holdTime: 0,
  speed: 1,
  romMode: 0,
  exercise: catalogExercise(`ex-${id}`, direction),
})

const list = [member('l', 'Left'), member('r', 'Right')]

describe('describeSegment preview exercise', () => {
  it('previews the first variant of a grouped pair', () => {
    const row = describeSegment(
      { kind: 'bilateral', startIndex: 0 },
      list,
      undefined,
      new Set(),
    )
    expect(row.previewExercise?.id).toBe('ex-l')
  })

  it('skips a variant marked for deferred removal', () => {
    const row = describeSegment(
      { kind: 'bilateral', startIndex: 0 },
      list,
      undefined,
      new Set(['l']),
    )
    expect(row.previewExercise?.id).toBe('ex-r')
  })

  it('keeps a preview when every variant is deferred', () => {
    const row = describeSegment(
      { kind: 'bilateral', startIndex: 0 },
      list,
      undefined,
      new Set(['l', 'r']),
    )
    expect(row.previewExercise?.id).toBe('ex-l')
  })

  it('previews each side of a split row on its own', () => {
    const row = describeSegment(
      { kind: 'single', startIndex: 1 },
      list,
      undefined,
      new Set(),
    )
    expect(row.previewExercise?.id).toBe('ex-r')
  })
})
