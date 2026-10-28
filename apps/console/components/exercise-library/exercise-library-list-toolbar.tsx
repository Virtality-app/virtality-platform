import { FolderClosed, Trash2 } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Checkbox } from '@/components/ui/checkbox'

interface ExerciseLibraryListToolbarProps {
  globalCheck: boolean
  onCheckAll: (checked: boolean) => void
  showExerciseLibraryAccess: boolean
  onOpenLibrary: () => void
  canDeleteSelected: boolean
  onDeleteSelected: () => void
}

const ExerciseLibraryListToolbar = ({
  globalCheck,
  onCheckAll,
  showExerciseLibraryAccess,
  onOpenLibrary,
  canDeleteSelected,
  onDeleteSelected,
}: ExerciseLibraryListToolbarProps) => {
  return (
    <div className='flex justify-between dark:bg-zinc-950'>
      <div className='flex items-center'>
        <Checkbox
          className='m-4'
          checked={globalCheck}
          onCheckedChange={onCheckAll}
        />
        <span className='text-sm'>Edit all</span>
      </div>

      {showExerciseLibraryAccess && (
        <div className='flex items-center gap-2'>
          <span>Exercise library</span>

          <Button variant='ghost' size='icon' onClick={onOpenLibrary}>
            <FolderClosed />
          </Button>
        </div>
      )}

      <div className='flex items-center'>
        <span>Remove Selected</span>
        <Button
          size='icon'
          variant='destructive'
          onClick={onDeleteSelected}
          disabled={!canDeleteSelected}
          className='m-4'
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}

export default ExerciseLibraryListToolbar
