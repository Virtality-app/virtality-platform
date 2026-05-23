import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ExerciseGrid from '@/components/ui/exercise-grid'
import { Button } from '@/components/ui/button'
import { useExerciseLibrary } from '@/context/exercise-library-context'

const ExerciseLibraryDialog = () => {
  const { state, handler } = useExerciseLibrary()
  const { isLibraryOpen } = state
  const { setLibraryOpen } = handler

  return (
    <Dialog open={isLibraryOpen} onOpenChange={setLibraryOpen}>
      <DialogContent className='z-1000 grid h-full max-h-[calc(100svh-40px)] max-w-[calc(100svw-40px)]! min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]'>
        <DialogHeader>
          <DialogTitle>Exercise Library</DialogTitle>
        </DialogHeader>
        <ExerciseGrid />
        <DialogFooter className='self'>
          <DialogClose asChild>
            <Button>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExerciseLibraryDialog
