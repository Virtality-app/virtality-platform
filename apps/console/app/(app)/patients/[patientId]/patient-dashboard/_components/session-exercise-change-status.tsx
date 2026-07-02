'use client'

import { Item } from '@/components/ui/item'
import { getDisplayName } from '@/lib/utils'
import { resolveExerciseChangeStatusMessage } from '@/lib/session-exercise-change-ui'
import type { CompleteExercise } from '@/types/models'
import type { PendingExerciseChange } from '@/lib/session-exercise-skip'
import type { Exercise } from '@virtality/db'
import { Loader2 } from 'lucide-react'

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

  const resolveCatalogExerciseName = (
    exerciseId: string,
    fallback: string,
  ): string => {
    const catalogExercise = defaultExercises?.find(
      (exercise) => exercise.id === exerciseId,
    )

    return getDisplayName(catalogExercise) ?? fallback
  }

  return (
    <Item
      variant='outline'
      size='sm'
      className='max-h-fit gap-2 border-amber-500/40 bg-amber-500/10 p-2 text-amber-100'
      aria-live='polite'
    >
      <Loader2 className='size-4 shrink-0 animate-spin' aria-hidden />
      <p className='text-sm leading-snug'>
        {resolveExerciseChangeStatusMessage({
          confirmedExerciseName: resolveCatalogExerciseName(
            confirmedExercise.exerciseId,
            'Current exercise',
          ),
          pendingExerciseName: resolveCatalogExerciseName(
            pendingExercise.exerciseId,
            'Pending exercise',
          ),
        })}
      </p>
    </Item>
  )
}

export default SessionExerciseChangeStatus
