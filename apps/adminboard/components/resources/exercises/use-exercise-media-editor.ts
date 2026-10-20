'use client'

import { getErrorMessage } from '@/lib/get-error-message'
import type { Exercise } from '@virtality/db'
import { useUpdateExerciseFamilyMedia } from '@virtality/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

type ExerciseMedia = { image: string | null; video: string | null }

/** Unsaved image and video for one Exercise family, saved to every row of it. */
export function useExerciseMediaEditor(
  exercise: Exercise,
  onSaved: () => void,
) {
  const [media, setMedia] = useState<ExerciseMedia>({
    image: exercise.image,
    video: exercise.video,
  })
  const mutation = useUpdateExerciseFamilyMedia()

  const isDirty =
    media.image !== exercise.image || media.video !== exercise.video

  const change = (patch: Partial<ExerciseMedia>) =>
    setMedia((current) => ({ ...current, ...patch }))

  const save = async () => {
    try {
      const { updated } = await mutation.mutateAsync({
        displayName: exercise.displayName,
        image: media.image,
        video: media.video,
      })
      toast.success(
        updated === 1 ? 'Media saved.' : `Media saved to ${updated} exercises.`,
      )
      onSaved()
    } catch (error) {
      toast.error(getErrorMessage(error, 'Saving media failed.'))
    }
  }

  return { media, change, save, isDirty, isSaving: mutation.isPending }
}
