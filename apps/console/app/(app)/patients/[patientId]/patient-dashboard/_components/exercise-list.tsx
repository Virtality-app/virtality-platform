'use client'
import { Fragment } from 'react'
import { cn, getDisplayName } from '@/lib/utils'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import ExerciseDescriptionCard from '@/components/ui/exercise-description-card'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import {
  Item,
  ItemActions,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
} from '@/components/ui/item'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from '@/components/ui/popover'
import ExerciseSettings from '@/components/ui/exercise-settings'
import { motion } from 'motion/react'
import { useExercise } from '@virtality/react-query'
import SuccessToasty from '@/components/ui/SuccessToasty'
import {
  isDirectExerciseSelectionDisabled,
  resolveCurrentExerciseIndex,
  resolveExerciseListHighlightState,
} from '@/lib/session-exercise-skip'
import {
  EXERCISE_LIST_HIGHLIGHT_LABEL,
  resolveDirectSelectionBlockedTooltip,
  resolveExerciseListHighlightBadgeClass,
  resolveExerciseListHighlightClass,
} from '@/lib/session-exercise-change-ui'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const ExerciseList = ({ className }: { className?: string }) => {
  const { state, handler, currExercise, requestDirectExerciseSelection } =
    usePatientDashboard()
  const {
    programState,
    selectedMode,
    exercises,
    selectedDevice,
    activeExerciseData,
    pendingExerciseChange,
  } = state
  const { setExercises, updatePatientDashboardState } = handler
  const { data: defaultExercises } = useExercise()

  const isProgramActive = programState === 'started'
  const isProgramInactive = programState === 'ready'
  const isProgramPaused = programState === 'paused'

  const isMain = selectedMode === 'main'
  const isActiveMainSession = (isProgramActive || isProgramPaused) && isMain
  const headsetConfirmedExerciseIndex = resolveCurrentExerciseIndex({
    exercises,
    activeExerciseId: activeExerciseData.id,
    fallbackIndex: currExercise.current,
  })
  const exerciseListHighlightContext = {
    headsetConfirmedExerciseIndex,
    pendingExerciseChange,
  }
  const isDirectSelectionBlocked =
    isProgramActive &&
    isMain &&
    isDirectExerciseSelectionDisabled({ pendingExerciseChange })
  const directSelectionBlockedTooltip = resolveDirectSelectionBlockedTooltip(
    isDirectSelectionBlocked ? pendingExerciseChange : null,
  )

  const handleExerciseSelection = (index: number, exerciseId: string) => {
    if (isProgramActive && isMain) {
      void requestDirectExerciseSelection(index)
      return
    }

    selectedDevice?.events.program.ChangeExercise(exerciseId)
    currExercise.current = index
  }

  const applySettings = (index: number) => {
    if (!exercises) return

    const { exerciseId, sets, reps, restTime, holdTime, speed, romMode } =
      exercises[index]

    const payload = {
      id: exerciseId,
      sets,
      reps,
      restTime,
      holdTime,
      speed,
      romMode,
    }

    if (currExercise.current === index) {
      try {
        updatePatientDashboardState({
          activeExerciseData: {
            ...activeExerciseData,
            totalReps: reps,
            totalSets: sets,
          },
        })
      } catch (error) {
        console.error(error)
      } finally {
        SuccessToasty('Settings applied to current exercise')
      }
    }

    if (isProgramActive) selectedDevice?.events.program.SettingsChange(payload)
  }

  const applySettingsToAllExercises = (index: number) => {
    if (!exercises.length) return

    const sourceExercise = exercises[index]
    if (!sourceExercise) return

    const { sets, reps, restTime, holdTime, speed, romMode } = sourceExercise
    const syncedExercises = exercises.map((exercise) => ({
      ...exercise,
      sets,
      reps,
      restTime,
      holdTime,
      speed,
      romMode,
    }))

    try {
      setExercises(syncedExercises)
    } catch (error) {
      console.error(error)
    } finally {
      SuccessToasty('Settings applied to all exercises')
    }
  }

  const moveExerciseUp = (index: number) => {
    if (index === 0 || !exercises) return

    const newExercises = [...exercises]
    ;[newExercises[index - 1], newExercises[index]] = [
      newExercises[index],
      newExercises[index - 1],
    ]

    setExercises(newExercises)
  }

  const moveExerciseDown = (index: number) => {
    if (index === exercises.length - 1 || !exercises) return

    const newExercises = [...exercises]
    ;[newExercises[index], newExercises[index + 1]] = [
      newExercises[index + 1],
      newExercises[index],
    ]

    setExercises(newExercises)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
          {isActiveMainSession && (
            <p className='text-muted-foreground text-xs'>
              Green ring: headset-confirmed exercise. Amber ring: pending change
              target.
            </p>
          )}
          {isDirectSelectionBlocked && directSelectionBlockedTooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className='text-xs text-amber-300'>
                  Exercise list selection is locked while a change is in flight.
                </p>
              </TooltipTrigger>
              <TooltipContent>{directSelectionBlockedTooltip}</TooltipContent>
            </Tooltip>
          )}
        </CardHeader>
        <CardContent className='overflow-auto p-2'>
          {exercises.length !== 0 ? (
            <ItemGroup>
              {exercises.map((ex, index) => {
                const highlightState = isActiveMainSession
                  ? resolveExerciseListHighlightState({
                      exerciseIndex: index,
                      ...exerciseListHighlightContext,
                    })
                  : null

                const defaultExercise = defaultExercises?.find(
                  (de) => de.id === ex.exerciseId,
                )

                return (
                  <Fragment key={ex.id}>
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
                        id={ex.id}
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
                            onClick={() => moveExerciseUp(index)}
                            disabled={
                              index === 0 || isProgramActive || isProgramPaused
                            }
                          >
                            <ChevronUp />
                          </Button>
                          <Button
                            size='icon-sm'
                            variant='ghost'
                            onClick={() => moveExerciseDown(index)}
                            disabled={
                              index === exercises.length - 1 ||
                              isProgramActive ||
                              isProgramPaused
                            }
                          >
                            <ChevronDown />
                          </Button>
                        </ItemMedia>
                        {defaultExercise && (
                          <ExerciseDescriptionCard exercise={defaultExercise} />
                        )}

                        <div className='flex min-w-0 flex-1 items-center gap-2'>
                          <p
                            className={cn(
                              'truncate overflow-x-hidden hover:cursor-pointer',
                              isDirectSelectionBlocked &&
                                'pointer-events-none opacity-60',
                            )}
                            onClick={() =>
                              handleExerciseSelection(index, ex.exerciseId)
                            }
                          >
                            {getDisplayName(defaultExercise)}
                          </p>
                          {highlightState && (
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase',
                                resolveExerciseListHighlightBadgeClass(
                                  highlightState,
                                ),
                              )}
                            >
                              {EXERCISE_LIST_HIGHLIGHT_LABEL[highlightState]}
                            </span>
                          )}
                        </div>

                        <ItemActions>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant='outline' size='icon'>
                                <Settings />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              side='right'
                              className='flex flex-col gap-4'
                            >
                              <ExerciseSettings
                                ex={ex}
                                exercises={exercises}
                                setExercises={setExercises}
                                index={index}
                                orientation='vertical'
                              />

                              <div className='col-start-3 flex gap-2 place-self-end'>
                                {exercises.length > 1 && (
                                  <Button
                                    variant='outline'
                                    onClick={() =>
                                      applySettingsToAllExercises(index)
                                    }
                                  >
                                    Apply to all
                                  </Button>
                                )}
                                <Button onClick={() => applySettings(index)}>
                                  Apply Changes
                                </Button>
                              </div>
                              <PopoverArrow className='fill-zinc-200 dark:fill-zinc-800' />
                            </PopoverContent>
                          </Popover>
                        </ItemActions>
                      </Item>
                    </motion.div>
                    {index !== exercises.length - 1 && <ItemSeparator />}
                  </Fragment>
                )
              })}
            </ItemGroup>
          ) : (
            <p className='text-muted-foreground'>No exercises...</p>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default ExerciseList
