import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'
import ExerciseSettings from './exercise-settings'
import { CompleteExercise } from '@/types/models'
import {
  isDeferredRemoval,
  type DeferredRemovalIdSet,
} from '@/lib/program-list-deferred-removal'
import type { SegmentRow } from './exercise-library-list-segments'

interface SegmentSettingsProps {
  row: SegmentRow
  exerciseList: CompleteExercise[]
  selectedItems: string[]
  updateExercises: (exercises: CompleteExercise[]) => void
  deferredRemoval: DeferredRemovalIdSet
}

const SegmentSettings = ({
  row,
  exerciseList,
  selectedItems,
  updateExercises,
  deferredRemoval,
}: SegmentSettingsProps) => {
  const { t } = useClientT('shared')
  const { isPair, primary, secondary, primaryIndex, secondaryIndex } = row
  const primaryDeferred = isDeferredRemoval(deferredRemoval, primary.id)
  const secondaryDeferred =
    secondary != null && isDeferredRemoval(deferredRemoval, secondary.id)

  if (isPair && secondary != null && secondaryIndex != null) {
    return (
      <div className='flex w-full flex-col gap-4'>
        <div className={cn('space-y-1', primaryDeferred && 'opacity-50')}>
          <p className='text-muted-foreground text-xs font-medium'>
            {t('exerciseLibrary.left')}
          </p>
          <ExerciseSettings
            key={`${primary.id}-left`}
            ex={primary}
            exercises={exerciseList}
            selectedItems={selectedItems}
            index={primaryIndex}
            setExercises={updateExercises}
            readOnly={primaryDeferred}
          />
        </div>
        <div className={cn('space-y-1', secondaryDeferred && 'opacity-50')}>
          <p className='text-muted-foreground text-xs font-medium'>
            {t('exerciseLibrary.right')}
          </p>
          <ExerciseSettings
            key={`${secondary.id}-right`}
            ex={secondary}
            exercises={exerciseList}
            selectedItems={selectedItems}
            index={secondaryIndex}
            setExercises={updateExercises}
            readOnly={secondaryDeferred}
          />
        </div>
      </div>
    )
  }
  return (
    <div className={cn('space-y-1', primaryDeferred && 'opacity-50')}>
      <p className='text-muted-foreground text-xs font-medium'>
        {primary.exercise?.direction}
      </p>

      <ExerciseSettings
        key={primary.id}
        ex={primary}
        exercises={exerciseList}
        selectedItems={selectedItems}
        index={primaryIndex}
        unifiedSiblingIndex={secondaryIndex}
        setExercises={updateExercises}
        readOnly={primaryDeferred}
      />
    </div>
  )
}

export default SegmentSettings
