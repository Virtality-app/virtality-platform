import { useClientT } from '@/i18n/use-client-t'
import { Separator } from '@virtality/ui/components/separator'
import { cn } from '@/lib/utils'
import ExerciseLibraryDialog from './exercise-library-dialog'
import { P } from '@/components/typography'
import ExerciseLibraryListToolbar from './exercise-library-list-toolbar'
import ExerciseSegmentRow from './exercise-segment-row'
import { useExerciseLibraryList } from './use-exercise-library-list'

interface ExerciseLibraryListProps {
  className?: string
  /** When false, hides the legacy Exercise Library button and nested dialog. */
  showExerciseLibraryAccess?: boolean
}

const ExerciseLibraryList = ({
  className,
  showExerciseLibraryAccess = true,
}: ExerciseLibraryListProps) => {
  const { t } = useClientT('shared')
  const list = useExerciseLibraryList()
  const { rows } = list

  return (
    <div className={cn('flex max-h-full w-full flex-col border', className)}>
      <ExerciseLibraryListToolbar
        globalCheck={list.globalCheck}
        onCheckAll={list.checkAll}
        showExerciseLibraryAccess={showExerciseLibraryAccess}
        onOpenLibrary={() => list.setLibraryOpen(true)}
        canDeleteSelected={list.selectedItems.length > 0}
        onDeleteSelected={list.deleteSelected}
      />
      <Separator />

      <ul className='flex max-h-full w-full flex-col gap-2 overflow-auto rounded-lg p-4 dark:text-zinc-200'>
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <ExerciseSegmentRow
              key={row.key}
              row={row}
              index={index}
              isLast={index === rows.length - 1}
              list={list}
            />
          ))
        ) : (
          <P>{t('exerciseLibrary.empty')}</P>
        )}
      </ul>

      {showExerciseLibraryAccess && <ExerciseLibraryDialog />}
    </div>
  )
}

export default ExerciseLibraryList
