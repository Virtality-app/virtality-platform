import { describe, expect, it, vi } from 'vitest'
import type { Exercise } from '@virtality/db'
import {
  familyMembersForLibrarySelection,
  groupExercisesIntoFamiliesByDisplayName,
  isProgramAvailableForTreatment,
  libraryFamilySelectionState,
  ReusableProgramKind,
} from '@virtality/shared/utils'
import {
  STANDARD_PROGRAM_EXERCISE_SETTINGS,
  type StarterTemplateExerciseRow,
  starterTemplateCatalogSelection,
  starterTemplateExerciseNamesForPreview,
  starterTemplateExercisesForEditor,
  starterTemplateExercisesForPreview,
  suggestedProgramNameFromTemplate,
} from './starter-template-create.js'

const unorderedThreeExerciseTemplate = [
  {
    exerciseId: 'ex-2',
    position: 1,
    sets: 99,
    reps: 99,
    restTime: 99,
    holdTime: 99,
    speed: 9,
  },
  {
    exerciseId: 'ex-1',
    position: 0,
    sets: 1,
    reps: 1,
    restTime: 1,
    holdTime: 1,
    speed: 1,
  },
  {
    exerciseId: 'ex-3',
    position: 2,
    sets: 2,
    reps: 2,
    restTime: 2,
    holdTime: 2,
    speed: 2,
  },
] as const satisfies readonly StarterTemplateExerciseRow[]

function wristFamilySelectionState(
  exercises: readonly Exercise[],
  isSelected: Record<string, boolean>,
) {
  const [wristFamily] = groupExercisesIntoFamiliesByDisplayName(
    exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.id,
      category: 'wrist',
      displayName: exercise.displayName,
      direction: exercise.direction,
      item: null,
    })),
  )

  expect(wristFamily).toBeDefined()

  return libraryFamilySelectionState(
    familyMembersForLibrarySelection(wristFamily!),
    isSelected,
  )
}

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

describe('starter template creation helpers', () => {
  it('previews enabled exercises in template order without dose or settings', () => {
    const previewExercises = starterTemplateExercisesForPreview(
      unorderedThreeExerciseTemplate,
      catalog,
    )

    expect(previewExercises.map((exercise) => exercise.id)).toEqual([
      'ex-1',
      'ex-2',
    ])

    const names = starterTemplateExerciseNamesForPreview(
      unorderedThreeExerciseTemplate,
      catalog,
    )

    expect(names).toEqual(['Wrist extension', 'Wrist extension'])
  })

  it('maps template exercises into catalog selection state by variant id', () => {
    const generateId = vi
      .fn()
      .mockReturnValueOnce('row-1')
      .mockReturnValueOnce('row-2')

    const selection = starterTemplateCatalogSelection(
      unorderedThreeExerciseTemplate,
      catalog,
      generateId,
    )

    expect(selection.isSelected).toEqual({
      'ex-1': true,
      'ex-2': true,
    })
    expect(selection.selectedExercises.map((row) => row.exerciseId)).toEqual([
      'ex-1',
      'ex-2',
    ])
    expect(selection.selectedExercises).toHaveLength(2)
    expect(selection.selectedExercises[0]).toMatchObject({
      id: 'row-1',
      exerciseId: 'ex-1',
      ...STANDARD_PROGRAM_EXERCISE_SETTINGS,
    })
  })

  it('uses partial family selection when the template includes one bilateral variant', () => {
    const generateId = vi.fn().mockReturnValue('row-1')

    const selection = starterTemplateCatalogSelection(
      [
        {
          exerciseId: 'ex-1',
          position: 0,
          sets: 12,
          reps: 20,
          restTime: 30,
          holdTime: 4,
          speed: 2.5,
        },
      ],
      catalog,
      generateId,
    )

    expect(wristFamilySelectionState(catalog, selection.isSelected)).toBe(
      'partial',
    )
  })

  it('uses full family selection when the template includes both bilateral variants', () => {
    const generateId = vi
      .fn()
      .mockReturnValueOnce('row-1')
      .mockReturnValueOnce('row-2')

    const selection = starterTemplateCatalogSelection(
      [
        {
          exerciseId: 'ex-1',
          position: 0,
          sets: 12,
          reps: 20,
          restTime: 30,
          holdTime: 4,
          speed: 2.5,
        },
        {
          exerciseId: 'ex-2',
          position: 1,
          sets: 8,
          reps: 15,
          restTime: 20,
          holdTime: 3,
          speed: 1.5,
        },
      ],
      catalog,
      generateId,
    )

    expect(wristFamilySelectionState(catalog, selection.isSelected)).toBe(
      'full',
    )
  })

  it('maps template exercises to standard default settings for the editor', () => {
    const generateId = vi
      .fn()
      .mockReturnValueOnce('row-1')
      .mockReturnValueOnce('row-2')

    const rows = starterTemplateExercisesForEditor(
      [
        {
          exerciseId: 'ex-1',
          position: 0,
          sets: 12,
          reps: 20,
          restTime: 30,
          holdTime: 4,
          speed: 2.5,
        },
        {
          exerciseId: 'ex-2',
          position: 1,
          sets: 8,
          reps: 15,
          restTime: 20,
          holdTime: 3,
          speed: 1.5,
        },
      ],
      catalog,
      generateId,
    )

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      id: 'row-1',
      exerciseId: 'ex-1',
      ...STANDARD_PROGRAM_EXERCISE_SETTINGS,
    })
    expect(rows[1]).toMatchObject({
      id: 'row-2',
      exerciseId: 'ex-2',
      ...STANDARD_PROGRAM_EXERCISE_SETTINGS,
    })
    expect(rows[0]?.sets).not.toBe(12)
    expect(rows[1]?.reps).not.toBe(15)
  })

  it('suggests the template name for the clinician-owned program editor', () => {
    expect(suggestedProgramNameFromTemplate('  Upper limb basics  ')).toBe(
      'Upper limb basics',
    )
  })

  it('keeps starter templates unavailable for treatment-time selection', () => {
    expect(
      isProgramAvailableForTreatment({
        id: 'template-1',
        name: 'Starter',
        kind: ReusableProgramKind.STARTER_TEMPLATE,
        userId: null,
        retiredAt: null,
      }),
    ).toBe(false)
  })
})
