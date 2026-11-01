import { describe, expect, it } from 'vitest'
import {
  buildSessionDataValue,
  createRandom,
  groupExerciseFamilies,
  seedId,
} from './clinical-bootstrap-builders.ts'
import { FALLBACK_EXERCISES } from './clinical-bootstrap-constants.ts'

describe('clinical bootstrap seed builders', () => {
  it('derives the same valid UUID for the same key', () => {
    const id = seedId('patient:giorgos')

    expect(id).toBe(seedId('patient:giorgos'))
    expect(id).not.toBe(seedId('patient:emma'))
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('keeps Left and Right variants of an exercise in one family', () => {
    const families = groupExerciseFamilies(FALLBACK_EXERCISES)

    expect(families.map((family) => family.map((e) => e.name))).toEqual([
      ['ActiveWristExtension_L', 'ActiveWristExtension_R'],
      ['ArmCirclesExternal'],
      ['ArmCirclesInternal'],
      ['AssistedAbductionto180°_L', 'AssistedAbductionto180°_R'],
    ])
  })

  it('writes one point per rep with a set_N score for each set', () => {
    const points = JSON.parse(
      buildSessionDataValue({
        sets: 2,
        reps: 8,
        baseScore: 35,
        sessionIndex: 0,
        random: createRandom('test'),
      }),
    ) as Record<string, number>[]

    expect(points).toHaveLength(8)
    expect(points.map((point) => point.rep)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    for (const point of points) {
      expect(Object.keys(point).sort()).toEqual(['rep', 'set_1', 'set_2'])
      expect(point.set_1).toBeGreaterThanOrEqual(0)
      expect(point.set_1).toBeLessThanOrEqual(100)
    }
  })

  it('scores later sessions higher on average', () => {
    const average = (sessionIndex: number) => {
      const points = JSON.parse(
        buildSessionDataValue({
          sets: 3,
          reps: 10,
          baseScore: 35,
          sessionIndex,
          random: createRandom(`progress:${sessionIndex}`),
        }),
      ) as Record<string, number>[]
      const scores = points.flatMap((point) =>
        Object.entries(point)
          .filter(([key]) => key.startsWith('set_'))
          .map(([, value]) => value),
      )
      return scores.reduce((sum, score) => sum + score, 0) / scores.length
    }

    expect(average(6)).toBeGreaterThan(average(0))
  })
})
