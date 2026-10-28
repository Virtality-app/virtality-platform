import { ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@virtality/ui/components/button'
import { Separator } from '@virtality/ui/components/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { SegmentRow } from './exercise-library-list-segments'
import type { ExerciseLibraryListState } from './use-exercise-library-list'
import SegmentDirectionToggles from './segment-direction-toggles'
import SegmentSettings from './segment-settings'

interface ExerciseSegmentRowProps {
  row: SegmentRow
  index: number
  isLast: boolean
  list: ExerciseLibraryListState
}

const ExerciseSegmentRow = ({
  row,
  index,
  isLast,
  list,
}: ExerciseSegmentRowProps) => {
  return (
    <li
      data-tour={index === 0 ? 'exercise-row' : undefined}
      className='space-y-2'
    >
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
        className={cn('flex flex-col', row.fullyDeferred && 'opacity-50')}
      >
        <div className='flex items-center gap-2'>
          <Checkbox
            checked={list.isRowChecked(row)}
            disabled={row.selectableMemberIds.length === 0}
            onCheckedChange={() => list.toggleRowSelection(row)}
          />
          <div className='flex flex-1 gap-2 p-1'>
            <p>{row.title}</p>
            {row.showDirectionToggles ? (
              <SegmentDirectionToggles
                members={row.members}
                deferredRemoval={list.deferredRemoval}
                onToggle={(side) => list.toggleDirection(row, side)}
              />
            ) : null}
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex flex-col'>
            <Button
              size='icon-sm'
              variant='ghost'
              onClick={() => list.moveRow(index, -1)}
              disabled={row.fullyDeferred || index === 0}
            >
              <ChevronUp />
            </Button>
            <Button
              size='icon-sm'
              variant='ghost'
              onClick={() => list.moveRow(index, 1)}
              disabled={row.fullyDeferred || isLast}
            >
              <ChevronDown />
            </Button>
          </div>
          <div className='flex-1'>
            <SegmentSettings
              row={row}
              exerciseList={list.exerciseList}
              selectedItems={list.selectedItems}
              updateExercises={list.updateExercises}
              deferredRemoval={list.deferredRemoval}
            />
          </div>
        </div>

        {isLast ? null : <Separator className='my-2' />}
      </motion.div>
    </li>
  )
}

export default ExerciseSegmentRow
