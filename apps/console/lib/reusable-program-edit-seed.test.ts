import { describe, expect, it } from 'vitest'
import type { Exercise } from '@virtality/db'
import {
  catalogSelectionExerciseIds,
  reusableProgramExercisesForCatalogSeed,
  reusableProgramMetadataForEdit,
} from './reusable-program-edit-seed.js'

const catalog = [
  {
    id: 'ex-1',
    displayName: 'Wrist extension',
    direction: 'Left',
    enabled: true,
  },
  {
    id: 'ex-2',
    displayName: 'Wrist extension',
    direction: 'Right',
    enabled: true,
  },
  {
    id: 'ex-3',
    displayName: 'Grip squeeze',
    direction: 'Left',
    enabled: false,
  },
] as Exercise[]

const programExercises = [
  {
    id: 'row-2',
    exerciseId: 'ex-2',
    position: 1,
    sets: 8,
    reps: 15,
    restTime: 20,
    holdTime: 3,
    speed: 1.5,
  },
  {
    id: 'row-1',
    exerciseId: 'ex-1',
    position: 0,
    sets: 12,
    reps: 20,
    restTime: 30,
    holdTime: 4,
    speed: 2.5,
  },
  {
    id: 'row-3',
    exerciseId: 'ex-3',
    position: 2,
    sets: 2,
    reps: 2,
    restTime: 2,
    holdTime: 2,
    speed: 2,
  },
]

describe('reusable program edit catalog seeding', () => {
  it('maps existing Program Exercises into catalog selection order with preserved settings', () => {
    const seeded = reusableProgramExercisesForCatalogSeed(
      programExercises,
      catalog,
    )

    expect(seeded.map((row) => row.exerciseId)).toEqual(['ex-1', 'ex-2'])
    expect(seeded.map((row) => row.id)).toEqual(['row-1', 'row-2'])
    expect(seeded[0]).toMatchObject({
      id: 'row-1',
      exerciseId: 'ex-1',
      sets: 12,
      reps: 20,
      restTime: 30,
      holdTime: 4,
      speed: 2.5,
      exercise: catalog[0],
    })
    expect(seeded[1]).toMatchObject({
      id: 'row-2',
      exerciseId: 'ex-2',
      sets: 8,
      reps: 15,
      restTime: 20,
      holdTime: 3,
      speed: 1.5,
      exercise: catalog[1],
    })
    expect(catalogSelectionExerciseIds(seeded)).toEqual(['ex-1', 'ex-2'])
  })

  it('keeps existing program metadata available for the settings step', () => {
    expect(
      reusableProgramMetadataForEdit({
        id: 'program-1',
        name: '  Shoulder rehab  ',
      }),
    ).toEqual({
      programId: 'program-1',
      name: 'Shoulder rehab',
    })
  })
})
