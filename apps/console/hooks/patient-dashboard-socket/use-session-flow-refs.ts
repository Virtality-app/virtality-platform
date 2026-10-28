import { ProgressDataPoint } from '@/types/models'
import { RefObject, useRef } from 'react'
import type { PendingExerciseChange } from '@/lib/session-exercise-skip'
import {
  canPersistSessionProgress,
  type SessionExerciseRowInput,
} from '@/lib/patient-dashboard-session-launch'
import type { SkipSafeProgressFlowState } from '@/lib/skip-safe-progress-flow'

type ProgressDataPerExercise = {
  [key: string]: ProgressDataPoint[]
}

const useSessionFlowRefs = (currExerciseRef: RefObject<number>) => {
  const progressDataRef = useRef<ProgressDataPerExercise | null>(null)
  const realTimeDataRef = useRef<ProgressDataPoint[]>([])
  const patientSessionIdRef = useRef('')
  const sessionExerciseRowsRef = useRef<SessionExerciseRowInput[]>([])
  const lastSyncedWorkingCopyRef = useRef<string | null>(null)
  const currSetRef = useRef(0)
  const currRepRef = useRef(0)
  const pendingExerciseChangeRef = useRef<PendingExerciseChange | null>(null)

  const readFlowState = (): SkipSafeProgressFlowState => ({
    patientSessionId: patientSessionIdRef.current,
    sessionExerciseRows: sessionExerciseRowsRef.current,
    headsetConfirmedExerciseIndex: currExerciseRef.current,
    pendingExerciseChange: pendingExerciseChangeRef.current,
    progressByExerciseId: progressDataRef.current ?? {},
    currentExerciseProgress: realTimeDataRef.current,
    currSet: currSetRef.current,
    currRep: currRepRef.current,
  })

  const writeFlowState = (next: SkipSafeProgressFlowState) => {
    patientSessionIdRef.current = next.patientSessionId
    sessionExerciseRowsRef.current = [...next.sessionExerciseRows]
    currExerciseRef.current = next.headsetConfirmedExerciseIndex
    pendingExerciseChangeRef.current = next.pendingExerciseChange
    progressDataRef.current = { ...next.progressByExerciseId }
    realTimeDataRef.current = [...next.currentExerciseProgress]
    currSetRef.current = next.currSet
    currRepRef.current = next.currRep
  }

  const canPersistFlowState = (state: SkipSafeProgressFlowState) =>
    canPersistSessionProgress(
      state.patientSessionId,
      state.sessionExerciseRows,
      state.headsetConfirmedExerciseIndex,
    )

  const setConfirmedExerciseIndex = (index: number) => {
    currExerciseRef.current = index
  }

  const setPendingExerciseChange = (change: PendingExerciseChange | null) => {
    pendingExerciseChangeRef.current = change
  }

  const resetCurrentExerciseProgress = (reps: number) => {
    currSetRef.current = 0
    currRepRef.current = 0
    realTimeDataRef.current = Array.from({ length: reps }, (_, i) => ({
      rep: i + 1,
    }))
    return realTimeDataRef.current
  }

  const recordStartedSession = (
    sessionId: string,
    rows: SessionExerciseRowInput[],
    serializedWorkingCopy: string,
  ) => {
    patientSessionIdRef.current = sessionId
    sessionExerciseRowsRef.current = rows
    lastSyncedWorkingCopyRef.current = serializedWorkingCopy
  }

  const resetSessionRefs = () => {
    patientSessionIdRef.current = ''
    sessionExerciseRowsRef.current = []
    lastSyncedWorkingCopyRef.current = null
  }

  return {
    currExerciseRef,
    progressDataRef,
    patientSessionIdRef,
    sessionExerciseRowsRef,
    lastSyncedWorkingCopyRef,
    pendingExerciseChangeRef,
    readFlowState,
    writeFlowState,
    canPersistFlowState,
    setConfirmedExerciseIndex,
    setPendingExerciseChange,
    resetCurrentExerciseProgress,
    recordStartedSession,
    resetSessionRefs,
  }
}

export type SessionFlowRefs = ReturnType<typeof useSessionFlowRefs>

export default useSessionFlowRefs
