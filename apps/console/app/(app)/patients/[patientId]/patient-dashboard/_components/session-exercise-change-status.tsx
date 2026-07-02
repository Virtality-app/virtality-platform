'use client'

import { Item } from '@/components/ui/item'
import { getDisplayName } from '@/lib/utils'
import {
  resolveExerciseChangeStatusMessage,
  resolveSessionExerciseChangeStatusItemClass,
  resolveSessionExerciseChangeStatusMessageClass,
} from '@/lib/session-exercise-change-ui'
import type { CompleteExercise } from '@/types/models'
import type { PendingExerciseChange } from '@/lib/session-exercise-skip'
import type { Exercise } from '@virtality/db'
import { Loader2 } from 'lucide-react'

function resolveCatalogExerciseName(
  exerciseId: string,
  fallback: string,
  defaultExercises?: Exercise[],
): string {
  const catalogExercise = defaultExercises?.find(
    (exercise) => exercise.id === exerciseId,
  )

  return getDisplayName(catalogExercise) ?? fallback
}

type SessionExerciseChangeStatusProps = {
  pendingExerciseChange: PendingExerciseChange
  exercises: CompleteExercise[]
  defaultExercises?: Exercise[]
}

const SessionExerciseChangeStatus = ({
  pendingExerciseChange,
  exercises,
  defaultExercises,
}: SessionExerciseChangeStatusProps) => {
  const confirmedExercise = exercises[pendingExerciseChange.sourceExerciseIndex]
  const pendingExercise = exercises[pendingExerciseChange.targetExerciseIndex]

  if (!confirmedExercise || !pendingExercise) {
    return null
  }

  const confirmedExerciseName = resolveCatalogExerciseName(
    confirmedExercise.exerciseId,
    'Current exercise',
    defaultExercises,
  )
  const pendingExerciseName = resolveCatalogExerciseName(
    pendingExercise.exerciseId,
    'Pending exercise',
    defaultExercises,
  )
  const statusMessage = resolveExerciseChangeStatusMessage({
    confirmedExerciseName,
    pendingExerciseName,
  })

  return (
    <Item
      variant='outline'
      size='sm'
      className={resolveSessionExerciseChangeStatusItemClass()}
      aria-live='polite'
    >
      <Loader2 className='size-3.5 shrink-0 animate-spin' aria-hidden />
      <p
        className={resolveSessionExerciseChangeStatusMessageClass()}
        title={statusMessage}
      >
        {statusMessage}
      </p>
    </Item>
  )
}

export default SessionExerciseChangeStatus
