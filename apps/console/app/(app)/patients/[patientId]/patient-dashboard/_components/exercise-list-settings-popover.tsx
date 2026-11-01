import { Settings } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from '@virtality/ui/components/popover'
import ExerciseSettings from '@/components/exercise-library/exercise-settings'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { useClientT } from '@/i18n/use-client-t'

interface ExerciseListSettingsPopoverProps {
  index: number
  exerciseName: string
  onApply: (index: number) => void
  onApplyToAll: (index: number) => void
}

/** Live settings for one exercise in the session working copy. */
const ExerciseListSettingsPopover = ({
  index,
  exerciseName,
  onApply,
  onApplyToAll,
}: ExerciseListSettingsPopoverProps) => {
  const { t } = useClientT('patient-dashboard')
  const { state, handler } = usePatientDashboard()
  const { exercises } = state
  const exercise = exercises[index]
  if (!exercise) return null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          aria-label={t('exerciseList.settings', { exercise: exerciseName })}
        >
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent side='right' className='flex flex-col gap-4'>
        <ExerciseSettings
          ex={exercise}
          exercises={exercises}
          setExercises={handler.setExercises}
          index={index}
          orientation='vertical'
        />

        <div className='flex flex-wrap gap-2'>
          {exercises.length > 1 && (
            <Button
              variant='outline'
              className='flex-1'
              onClick={() => onApplyToAll(index)}
            >
              {t('exerciseList.applyToAll')}
            </Button>
          )}
          <Button className='flex-1' onClick={() => onApply(index)}>
            {t('exerciseList.applyChanges')}
          </Button>
        </div>
        <PopoverArrow className='fill-zinc-200 dark:fill-zinc-800' />
      </PopoverContent>
    </Popover>
  )
}

export default ExerciseListSettingsPopover
