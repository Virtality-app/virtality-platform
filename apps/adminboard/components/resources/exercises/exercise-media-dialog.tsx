'use client'

import { ExerciseWizardMediaStep } from '@/components/exercise-wizard/exercise-wizard-media-step'
import { useExerciseMediaEditor } from '@/components/resources/exercises/use-exercise-media-editor'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Exercise } from '@virtality/db'

type ExerciseMediaDialogProps = {
  exercise: Exercise
  onClose: () => void
}

/** Edit the image and video of an existing Exercise family. */
export function ExerciseMediaDialog({
  exercise,
  onClose,
}: ExerciseMediaDialogProps) {
  const editor = useExerciseMediaEditor(exercise, onClose)

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Edit media: {exercise.displayName}</DialogTitle>
          <DialogDescription>
            Saving applies to every exercise named “{exercise.displayName}”, so
            Left and Right stay in sync.
          </DialogDescription>
        </DialogHeader>
        <ExerciseWizardMediaStep
          displayName={exercise.displayName}
          image={editor.media.image}
          video={editor.media.video}
          onChange={editor.change}
        />
        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            type='button'
            disabled={!editor.isDirty || editor.isSaving}
            onClick={() => void editor.save()}
          >
            {editor.isSaving ? 'Saving…' : 'Save media'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
