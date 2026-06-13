import { describe, expect, it } from 'vitest'
import {
  ReusableProgramFormSchema,
  canSubmitReusableProgram,
  isStarterTemplateProgram,
  reusableProgramExercisesForCreateSubmit,
  reusableProgramExercisesForEditSubmit,
} from './program-library-submit.js'

const variants = [
  {
    id: 'row-left',
    exerciseId: 'squat-left',
    sets: 4,
    reps: 12,
    restTime: 30,
    holdTime: 2,
    speed: 1.5,
  },
  {
    id: 'row-right',
    exerciseId: 'squat-right',
    sets: 4,
    reps: 12,
    restTime: 30,
    holdTime: 2,
    speed: 1.5,
  },
  {
    id: 'row-solo',
    exerciseId: 'march',
    sets: 3,
    reps: 10,
    restTime: 5,
    holdTime: 1,
    speed: 1,
  },
]

describe('reusable program form validation', () => {
  it('requires a non-empty trimmed program name', () => {
    expect(ReusableProgramFormSchema.safeParse({ name: '' }).success).toBe(
      false,
    )
    expect(ReusableProgramFormSchema.safeParse({ name: '   ' }).success).toBe(
      false,
    )
    expect(
      ReusableProgramFormSchema.safeParse({ name: 'Shoulder rehab' }).success,
    ).toBe(true)
  })
})

describe('reusable program submit guards', () => {
  it('blocks submit when the name is empty', () => {
    expect(canSubmitReusableProgram('', variants, [])).toEqual({
      ok: false,
      reason: 'name',
    })
  })

  it('blocks submit when no enabled exercise variants remain', () => {
    expect(
      canSubmitReusableProgram('Shoulder rehab', variants, [
        'row-left',
        'row-right',
        'row-solo',
      ]),
    ).toEqual({
      ok: false,
      reason: 'exercises',
    })
  })

  it('allows submit when name and enabled variants are present', () => {
    expect(canSubmitReusableProgram('Shoulder rehab', variants, [])).toEqual({
      ok: true,
    })
  })
})

describe('reusable program exercise submit payloads', () => {
  it('builds create payloads with fresh row ids, settings, and positions', () => {
    const ids = ['new-1', 'new-2']
    let index = 0

    expect(
      reusableProgramExercisesForCreateSubmit(
        variants,
        ['row-solo'],
        'program-1',
        () => ids[index++]!,
      ),
    ).toEqual([
      {
        id: 'new-1',
        reusableProgramId: 'program-1',
        exerciseId: 'squat-left',
        position: 0,
        sets: 4,
        reps: 12,
        restTime: 30,
        holdTime: 2,
        speed: 1.5,
      },
      {
        id: 'new-2',
        reusableProgramId: 'program-1',
        exerciseId: 'squat-right',
        position: 1,
        sets: 4,
        reps: 12,
        restTime: 30,
        holdTime: 2,
        speed: 1.5,
      },
    ])
  })

  it('builds edit payloads with stable row ids and unique positions', () => {
    expect(
      reusableProgramExercisesForEditSubmit(
        variants,
        ['row-solo'],
        'program-1',
      ),
    ).toEqual([
      {
        id: 'row-left',
        reusableProgramId: 'program-1',
        exerciseId: 'squat-left',
        position: 0,
        sets: 4,
        reps: 12,
        restTime: 30,
        holdTime: 2,
        speed: 1.5,
      },
      {
        id: 'row-right',
        reusableProgramId: 'program-1',
        exerciseId: 'squat-right',
        position: 1,
        sets: 4,
        reps: 12,
        restTime: 30,
        holdTime: 2,
        speed: 1.5,
      },
    ])
  })

  it('supports duplicate exercise ids as separate rows', () => {
    const duplicateVariants = [
      {
        id: 'row-a',
        exerciseId: 'march',
        sets: 3,
        reps: 10,
        restTime: 5,
        holdTime: 1,
        speed: 1,
      },
      {
        id: 'row-b',
        exerciseId: 'march',
        sets: 2,
        reps: 8,
        restTime: 10,
        holdTime: 3,
        speed: 0.8,
      },
    ]

    expect(
      reusableProgramExercisesForEditSubmit(
        duplicateVariants,
        [],
        'program-duplicate',
      ),
    ).toEqual([
      {
        id: 'row-a',
        reusableProgramId: 'program-duplicate',
        exerciseId: 'march',
        position: 0,
        sets: 3,
        reps: 10,
        restTime: 5,
        holdTime: 1,
        speed: 1,
      },
      {
        id: 'row-b',
        reusableProgramId: 'program-duplicate',
        exerciseId: 'march',
        position: 1,
        sets: 2,
        reps: 8,
        restTime: 10,
        holdTime: 3,
        speed: 0.8,
      },
    ])
  })
})

describe('starter template edit guard', () => {
  it('identifies starter templates as non-editable through clinician flows', () => {
    expect(isStarterTemplateProgram({ kind: 'STARTER_TEMPLATE' })).toBe(true)
    expect(isStarterTemplateProgram({ kind: 'CLINICIAN_OWNED' })).toBe(false)
  })
})
