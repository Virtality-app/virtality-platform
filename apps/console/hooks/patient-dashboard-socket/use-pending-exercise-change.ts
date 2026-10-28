import { useRef } from 'react'
import i18next from '@/i18n/i18next'
import { notify } from '@/lib/notify'
import { getDisplayName } from '@/lib/utils'
import type { PendingExerciseChange } from '@/lib/session-exercise-skip'
import {
  EXERCISE_CHANGE_ACK_TIMEOUT_MS,
  resolveExerciseChangeFailureMessage,
} from '@/lib/session-exercise-change-ui'
import { failPendingExerciseChangeInFlow } from '@/lib/skip-safe-progress-flow'
import type { SessionFlowRefs } from './use-session-flow-refs'
import type { DashboardHandler, DashboardState } from './types'

interface usePendingExerciseChangeProps {
  flow: SessionFlowRefs
  exercises: DashboardState['exercises']
  updatePatientDashboardState: DashboardHandler['updatePatientDashboardState']
}

const usePendingExerciseChange = ({
  flow,
  exercises,
  updatePatientDashboardState,
}: usePendingExerciseChangeProps) => {
  const pendingExerciseChangeTimeout = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  const clearPendingExerciseChangeTimeout = () => {
    if (pendingExerciseChangeTimeout.current) {
      clearTimeout(pendingExerciseChangeTimeout.current)
      pendingExerciseChangeTimeout.current = null
    }
  }

  const syncPendingExerciseChangeUi = (
    change: PendingExerciseChange | null,
  ) => {
    updatePatientDashboardState({ pendingExerciseChange: change })
  }

  const clearPendingExerciseChange = () => {
    clearPendingExerciseChangeTimeout()
    flow.setPendingExerciseChange(null)
    syncPendingExerciseChangeUi(null)
  }

  const handlePendingExerciseChangeFailure = () => {
    const pending = flow.pendingExerciseChangeRef.current

    if (!pending) {
      return
    }

    const result = failPendingExerciseChangeInFlow(flow.readFlowState())

    if (!result.failed) {
      return
    }

    const sourceExercise = exercises?.[pending.sourceExerciseIndex]
    const confirmedExerciseName =
      getDisplayName(sourceExercise?.exercise) ??
      i18next.t('exerciseChange.currentFallback')

    flow.writeFlowState(result.state)
    clearPendingExerciseChange()
    notify.error(resolveExerciseChangeFailureMessage(confirmedExerciseName))
  }

  const trackPendingExerciseChange = (change: PendingExerciseChange) => {
    syncPendingExerciseChangeUi(change)
    clearPendingExerciseChangeTimeout()
    pendingExerciseChangeTimeout.current = setTimeout(() => {
      handlePendingExerciseChangeFailure()
    }, EXERCISE_CHANGE_ACK_TIMEOUT_MS)
  }

  return { trackPendingExerciseChange, clearPendingExerciseChange }
}

export type PendingExerciseChangeHandlers = ReturnType<
  typeof usePendingExerciseChange
>

export default usePendingExerciseChange
