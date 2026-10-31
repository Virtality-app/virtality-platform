import { describe, expect, it } from 'vitest'
import { buildSessionCompletionSummary } from './session-completion-summary'

const reps = (count: number, setKey = 'set_1') =>
  JSON.stringify(
    Array.from({ length: count }, (_, i) => ({ rep: i + 1, [setKey]: 50 })),
  )

describe('buildSessionCompletionSummary', () => {
  it('returns null without a session', () => {
    expect(buildSessionCompletionSummary(null)).toBeNull()
  })

  it('counts recorded reps and the exercises that have them', () => {
    const summary = buildSessionCompletionSummary(
      {
        createdAt: '2026-10-31T10:00:00Z',
        completedAt: '2026-10-31T10:12:40Z',
        sessionExercise: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
        sessionData: [
          { sessionExerciseId: 'a', value: reps(10) },
          { sessionExerciseId: 'a', value: reps(4, 'set_2') },
          { sessionExerciseId: 'b', value: reps(3) },
          { sessionExerciseId: 'c', value: '[]' },
        ],
      },
      new Date('2026-10-31T11:00:00Z'),
    )

    expect(summary).toEqual({
      durationMinutes: 12,
      exercisesWithProgress: 2,
      exercisesPlanned: 3,
      repsRecorded: 17,
    })
  })

  it('measures an open session up to now', () => {
    const summary = buildSessionCompletionSummary(
      { createdAt: '2026-10-31T10:00:00Z' },
      new Date('2026-10-31T10:05:59Z'),
    )

    expect(summary?.durationMinutes).toBe(5)
  })

  it('ignores unreadable progress values', () => {
    const summary = buildSessionCompletionSummary({
      createdAt: null,
      sessionData: [{ sessionExerciseId: 'a', value: 'not json' }],
    })

    expect(summary).toMatchObject({
      durationMinutes: null,
      exercisesWithProgress: 0,
      repsRecorded: 0,
    })
  })
})
