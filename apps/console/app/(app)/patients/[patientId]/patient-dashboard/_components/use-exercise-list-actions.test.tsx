import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useExerciseListActions } from './use-exercise-list-actions'

const row = (exerciseId: string, reps: number) => ({
  id: `row-${exerciseId}`,
  exerciseId,
  sets: 2,
  reps,
  restTime: 3,
  holdTime: 1,
  speed: 1,
  romMode: 0,
})

const mocks = vi.hoisted(() => {
  const program = { SettingsChange: vi.fn(), ChangeExercise: vi.fn() }
  return {
    program,
    state: {
      programState: 'started',
      selectedMode: 'main',
      exercises: [] as ReturnType<typeof row>[],
      selectedDevice: { events: { program } },
    },
    setExercises: vi.fn(),
    applyCurrentExerciseSettings: vi.fn(),
  }
})

vi.mock('@/context/patient-dashboard-context', () => ({
  usePatientDashboard: () => ({
    state: mocks.state,
    handler: { setExercises: mocks.setExercises },
    currExercise: { current: 0 },
    requestDirectExerciseSelection: vi.fn(),
    applyCurrentExerciseSettings: mocks.applyCurrentExerciseSettings,
  }),
}))

vi.mock('@/lib/notify', () => ({ notify: { success: vi.fn() } }))

describe('useExerciseListActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.state.programState = 'started'
    mocks.state.exercises = [row('1', 10), row('2', 8), row('3', 6)]
  })

  afterEach(cleanup)

  it('Apply to all sends the source settings for every exercise to the headset', () => {
    const { result } = renderHook(() => useExerciseListActions())

    result.current.applySettingsToAllExercises(2)

    expect(mocks.program.SettingsChange.mock.calls).toEqual(
      ['1', '2', '3'].map((id) => [
        {
          id,
          sets: 2,
          reps: 6,
          restTime: 3,
          holdTime: 1,
          speed: 1,
          romMode: 0,
        },
      ]),
    )
  })

  it('Apply to all sends nothing to the headset when no program is running', () => {
    mocks.state.programState = 'ready'
    const { result } = renderHook(() => useExerciseListActions())

    result.current.applySettingsToAllExercises(0)

    expect(mocks.program.SettingsChange).not.toHaveBeenCalled()
    expect(mocks.setExercises).toHaveBeenCalledOnce()
  })

  it('Apply changes sends only that exercise', () => {
    const { result } = renderHook(() => useExerciseListActions())

    result.current.applySettings(1)

    expect(mocks.program.SettingsChange).toHaveBeenCalledOnce()
    expect(mocks.program.SettingsChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: '2', reps: 8 }),
    )
  })
})
