import { motion } from 'motion/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Item, ItemActions, ItemMedia } from '@/components/ui/item'
import ExerciseDescriptionCard from '@/components/exercise-library/exercise-description-card'
import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'
import {
  exerciseListHighlightLabel,
  resolveExerciseListHighlightBadgeClass,
  resolveExerciseListHighlightClass,
  shouldShowExerciseListHighlightBadge,
} from '@/lib/session-exercise-change-ui'
import ExerciseListSettingsPopover from './exercise-list-settings-popover'

type HighlightState = Parameters<typeof resolveExerciseListHighlightClass>[0]
type DescribedExercise = Parameters<
  typeof ExerciseDescriptionCard
>[0]['exercise']

interface ExerciseListRowProps {
  rowId: string
  index: number
  exerciseName: string
  defaultExercise?: DescribedExercise
  highlightState: HighlightState
  isFirst: boolean
  isLast: boolean
  /** Reordering is off while a session runs or is paused. */
  reorderLocked: boolean
  /** A headset exercise change is in flight. */
  selectionBlocked: boolean
  onSelect: (index: number) => void
  onMove: (index: number, offset: -1 | 1) => void
  onApply: (index: number) => void
  onApplyToAll: (index: number) => void
}

const ExerciseListRow = ({
  rowId,
  index,
  exerciseName,
  defaultExercise,
  highlightState,
  isFirst,
  isLast,
  reorderLocked,
  selectionBlocked,
  onSelect,
  onMove,
  onApply,
  onApplyToAll,
}: ExerciseListRowProps) => {
  const { t } = useClientT('patient-dashboard')

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{
        layout: { duration: 0.3, ease: 'easeInOut' },
        opacity: { duration: 0.2 },
        y: { duration: 0.2 },
      }}
    >
      <Item
        id={rowId}
        size='sm'
        className={cn(
          'hover:bg-vital-blue-700/20 px-2',
          resolveExerciseListHighlightClass(highlightState),
        )}
      >
        <ItemMedia className='flex-col'>
          <Button
            size='icon-sm'
            variant='ghost'
            aria-label={t('exerciseList.moveUp', { exercise: exerciseName })}
            onClick={() => onMove(index, -1)}
            disabled={isFirst || reorderLocked}
          >
            <ChevronUp />
          </Button>
          <Button
            size='icon-sm'
            variant='ghost'
            aria-label={t('exerciseList.moveDown', { exercise: exerciseName })}
            onClick={() => onMove(index, 1)}
            disabled={isLast || reorderLocked}
          >
            <ChevronDown />
          </Button>
        </ItemMedia>
        {defaultExercise && (
          <ExerciseDescriptionCard exercise={defaultExercise} />
        )}

        <div className='flex min-w-0 flex-1 items-center gap-2'>
          <button
            type='button'
            className={cn(
              'focus-visible:ring-ring/50 min-h-9 truncate rounded-sm text-left outline-none hover:underline focus-visible:ring-[3px]',
              selectionBlocked && 'pointer-events-none opacity-60',
            )}
            aria-label={t('exerciseList.goTo', { exercise: exerciseName })}
            disabled={selectionBlocked}
            onClick={() => onSelect(index)}
          >
            {exerciseName}
          </button>
          {shouldShowExerciseListHighlightBadge(highlightState) && (
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                resolveExerciseListHighlightBadgeClass(highlightState),
              )}
            >
              {exerciseListHighlightLabel(highlightState)}
            </span>
          )}
        </div>

        <ItemActions>
          <ExerciseListSettingsPopover
            index={index}
            exerciseName={exerciseName}
            onApply={onApply}
            onApplyToAll={onApplyToAll}
          />
        </ItemActions>
      </Item>
    </motion.div>
  )
}

export default ExerciseListRow
