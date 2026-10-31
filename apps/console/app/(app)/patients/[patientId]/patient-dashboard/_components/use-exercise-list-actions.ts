import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { notify } from '@/lib/notify'

/** Reorder, live-settings and exercise-change actions for the session exercise list. */
export function useExerciseListActions() {
  const { state, handler, currExercise, requestDirectExerciseSelection } =
    usePatientDashboard()
  const {
    programState,
    selectedMode,
    exercises,
    selectedDevice,
    activeExerciseData,
  } = state
  const { setExercises, updatePatientDashboardState } = handler
  const isProgramActive = programState === 'started'
  const isMain = selectedMode === 'main'

  const selectExercise = (index: number, exerciseId: string) => {
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
        notify.success({
          key: 'toast.settingsAppliedCurrent',
          ns: 'patient-dashboard',
        })
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
      notify.success({
        key: 'toast.settingsAppliedAll',
        ns: 'patient-dashboard',
      })
    }
  }

  const moveExercise = (index: number, offset: -1 | 1) => {
    const target = index + offset
    if (!exercises || target < 0 || target >= exercises.length) return

    const newExercises = [...exercises]
    ;[newExercises[index], newExercises[target]] = [
      newExercises[target],
      newExercises[index],
    ]

    setExercises(newExercises)
  }

  return {
    selectExercise,
    applySettings,
    applySettingsToAllExercises,
    moveExercise,
  }
}
