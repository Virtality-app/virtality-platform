import type { PatientSession, ReusableProgramExercise } from '@virtality/db'
import type { CompleteExercise, CompleteReusableProgram } from '@/types/models'

export type DashboardReusableProgram = CompleteReusableProgram

export function reusableProgramExercisesToSessionCopy(
  exercises: ReusableProgramExercise[],
): CompleteExercise[] {
  return exercises.map((exercise) => ({
    id: exercise.id,
    exerciseId: exercise.exerciseId,
    sets: exercise.sets,
    reps: exercise.reps,
    restTime: exercise.restTime,
    holdTime: exercise.holdTime,
    speed: exercise.speed,
    romMode: 0 as const,
  }))
}

export function resolveLastUsedProgram(
  programs: DashboardReusableProgram[] | undefined,
  lastProgramId: string | undefined,
): DashboardReusableProgram | null {
  if (!programs || !lastProgramId) return null
  return programs.find((program) => program.id === lastProgramId) ?? null
}

/**
 * The source program of the patient's latest finished session, or null when
 * that session was a Quick Start. Stands in for the Last Used Program when
 * this browser has none remembered (another computer, cleared storage).
 */
export function resolveRecentSessionProgramId<
  T extends Pick<
    PatientSession,
    'status' | 'createdAt' | 'sourceReusableProgramId'
  >,
>(sessions: T[] | undefined): string | null {
  let latest: T | null = null
  for (const session of sessions ?? []) {
    if (session.status === 'ACTIVE') continue
    if (
      !latest ||
      new Date(session.createdAt).getTime() >
        new Date(latest.createdAt).getTime()
    )
      latest = session
  }
  return latest?.sourceReusableProgramId ?? null
}

export function orderProgramsForDashboardSelection<
  T extends Pick<DashboardReusableProgram, 'id' | 'updatedAt'>,
>(programs: T[], lastProgramId: string | undefined): T[] {
  if (!lastProgramId) return programs

  const lastUsed = programs.find((program) => program.id === lastProgramId)
  if (!lastUsed) return programs

  return [
    lastUsed,
    ...programs.filter((program) => program.id !== lastProgramId),
  ]
}

export function buildProgramSelectionState(
  program: DashboardReusableProgram,
  activeExerciseData: {
    currentRep: number
    currentSet: number
    totalReps: number
    totalSets: number
    id: string | null
  },
) {
  const sessionExercises = reusableProgramExercisesToSessionCopy(
    program.exercises,
  )
  const firstExercise = sessionExercises[0]

  return {
    selectedProgram: program,
    exercises: sessionExercises,
    activeExerciseData: {
      ...activeExerciseData,
      id: firstExercise ? firstExercise.exerciseId : null,
      totalReps: firstExercise ? firstExercise.reps : 0,
      totalSets: firstExercise ? firstExercise.sets : 0,
    },
  }
}

export function isSessionCopyIsolatedFromLibrary(
  libraryExercises: ReusableProgramExercise[],
  sessionExercises: CompleteExercise[],
): boolean {
  if (libraryExercises.length !== sessionExercises.length) return false

  return libraryExercises.every((libraryExercise, index) => {
    const sessionExercise = sessionExercises[index]
    if (!sessionExercise) return false

    return (
      libraryExercise.id === sessionExercise.id &&
      libraryExercise.exerciseId === sessionExercise.exerciseId &&
      libraryExercise.sets === sessionExercise.sets &&
      libraryExercise.reps === sessionExercise.reps &&
      libraryExercise.restTime === sessionExercise.restTime &&
      libraryExercise.holdTime === sessionExercise.holdTime &&
      libraryExercise.speed === sessionExercise.speed
    )
  })
}
