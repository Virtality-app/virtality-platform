import { useEffect } from 'react'
import { useSyncSessionWorkingCopy } from '@virtality/react-query'
import { generateUUID } from '@virtality/shared/utils'
import {
  buildSessionWorkingCopySyncPayload,
  serializeSessionWorkingCopy,
  shouldPersistSessionWorkingCopy,
} from '@/lib/session-working-copy-sync'
import type { SessionFlowRefs } from './use-session-flow-refs'
import type { DashboardState } from './types'

interface useSessionWorkingCopySyncProps {
  flow: SessionFlowRefs
  programState: DashboardState['programState']
  exercises: DashboardState['exercises']
}

const useSessionWorkingCopySync = ({
  flow,
  programState,
  exercises,
}: useSessionWorkingCopySyncProps) => {
  const { mutateAsync: syncSessionWorkingCopy } = useSyncSessionWorkingCopy()
  const {
    patientSessionIdRef,
    sessionExerciseRowsRef,
    lastSyncedWorkingCopyRef,
  } = flow

  useEffect(() => {
    if (
      !shouldPersistSessionWorkingCopy(
        programState,
        patientSessionIdRef.current,
        exercises,
      )
    ) {
      return
    }

    const serializedWorkingCopy = serializeSessionWorkingCopy(exercises)
    if (serializedWorkingCopy === lastSyncedWorkingCopyRef.current) {
      return
    }

    const payload = buildSessionWorkingCopySyncPayload({
      sessionId: patientSessionIdRef.current,
      exercises,
      persistedRows: sessionExerciseRowsRef.current,
      createId: generateUUID,
    })

    void syncSessionWorkingCopy(payload)
      .then((result) => {
        sessionExerciseRowsRef.current = result.exercises.map((exercise) => ({
          ...exercise,
          patientSessionId: patientSessionIdRef.current,
        }))
        lastSyncedWorkingCopyRef.current = serializedWorkingCopy
      })
      .catch((error) => {
        console.error(error)
      })
  }, [
    exercises,
    programState,
    syncSessionWorkingCopy,
    patientSessionIdRef,
    sessionExerciseRowsRef,
    lastSyncedWorkingCopyRef,
  ])
}

export default useSessionWorkingCopySync
