import { describe, expect, it } from 'vitest'
import {
  buildSessionExerciseRowsFromWorkingCopy,
  buildStartedSessionInput,
  canPersistSessionProgress,
  resolveSourceProgramContext,
  shouldCreatePatientSessionOnStartAck,
} from './patient-dashboard-session-launch.js'
import type { CompleteExercise, CompleteReusableProgram } from '@/types/models'

const sampleProgram: Pick<CompleteReusableProgram, 'id' | 'name'> = {
  id: 'program-1',
  name: 'Shoulder rehab',
}

const sampleExercises: CompleteExercise[] = [
  {
    id: 'row-1',
    exerciseId: 'ex-1',
    sets: 3,
    reps: 10,
    restTime: 5,
    holdTime: 1,
    speed: 1,
    romMode: 0,
  },
  {
    id: 'row-2',
    exerciseId: 'ex-2',
    sets: 2,
    reps: 8,
    restTime: 4,
    holdTime: 2,
    speed: 1.5,
    romMode: 0,
  },
]

describe('resolveSourceProgramContext', () => {
  it('stores reusable program source for library selections', () => {
    expect(resolveSourceProgramContext(false, sampleProgram)).toEqual({
      sourceReusableProgramId: 'program-1',
      sourceProgramName: 'Shoulder rehab',
    })
  })

  it('leaves source empty for Quick Start sessions', () => {
    expect(resolveSourceProgramContext(true, sampleProgram)).toEqual({
      sourceReusableProgramId: null,
      sourceProgramName: null,
    })
  })
})

describe('buildStartedSessionInput', () => {
  it('creates an active started session with source context', () => {
    expect(
      buildStartedSessionInput({
        sessionId: 'session-1',
        patientId: 'patient-1',
        source: resolveSourceProgramContext(false, sampleProgram),
      }),
    ).toEqual({
      id: 'session-1',
      patientId: 'patient-1',
      programId: null,
      status: 'ACTIVE',
      sourceReusableProgramId: 'program-1',
      sourceProgramName: 'Shoulder rehab',
      nprs: null,
      notes: null,
      createdAt: expect.any(Date),
      completedAt: null,
      deletedAt: null,
    })
  })
})

describe('buildSessionExerciseRowsFromWorkingCopy', () => {
  it('creates stable row ids, settings, and positions from the working copy', () => {
    let counter = 0
    const rows = buildSessionExerciseRowsFromWorkingCopy(
      sampleExercises,
      'session-1',
      () => `session-row-${++counter}`,
    )

    expect(rows).toEqual([
      {
        id: 'session-row-1',
        patientSessionId: 'session-1',
        exerciseId: 'ex-1',
        position: 0,
        sets: 3,
        reps: 10,
        restTime: 5,
        holdTime: 1,
        speed: 1,
      },
      {
        id: 'session-row-2',
        patientSessionId: 'session-1',
        exerciseId: 'ex-2',
        position: 1,
        sets: 2,
        reps: 8,
        restTime: 4,
        holdTime: 2,
        speed: 1.5,
      },
    ])
  })
})

describe('canPersistSessionProgress', () => {
  const rows = buildSessionExerciseRowsFromWorkingCopy(
    sampleExercises,
    'session-1',
    () => 'row-id',
  )

  it('blocks progress before a started session exists', () => {
    expect(canPersistSessionProgress(undefined, rows, 0)).toBe(false)
  })

  it('blocks progress when session exercise rows are missing', () => {
    expect(canPersistSessionProgress('session-1', undefined, 0)).toBe(false)
  })

  it('allows progress once session and exercise rows exist', () => {
    expect(canPersistSessionProgress('session-1', rows, 0)).toBe(true)
  })
})

describe('shouldCreatePatientSessionOnStartAck', () => {
  it('only creates a session after a launch attempt', () => {
    expect(shouldCreatePatientSessionOnStartAck('ready')).toBe(false)
    expect(shouldCreatePatientSessionOnStartAck('launching')).toBe(true)
    expect(shouldCreatePatientSessionOnStartAck('started')).toBe(false)
  })
})
