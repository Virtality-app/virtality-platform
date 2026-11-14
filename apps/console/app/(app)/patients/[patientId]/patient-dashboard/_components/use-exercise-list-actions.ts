import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { notify } from '@/lib/notify'

type ExerciseSettingsRow = {
  exerciseId: string
  sets: number
  reps: number
  restTime: number
  holdTime: number
  speed: number
  romMode: number
}

/** The `SettingsChange` payload the headset applies to one exercise. */
const toSettingsPayload = ({
  exerciseId,
  sets,
  reps,
  restTime,
  holdTime,
  speed,
  romMode,
}: ExerciseSettingsRow) => ({
  id: exerciseId,
  sets,
  reps,
  restTime,
  holdTime,
  speed,
  romMode,
})

/** Reorder, live-settings and exercise-change actions for the session exercise list. */
export function useExerciseListActions() {
  const {
    state,
    handler,
    currExercise,
    requestDirectExerciseSelection,
    applyCurrentExerciseSettings,
  } = usePatientDashboard()
  const { programState, selectedMode, exercises, selectedDevice } = state
  const { setExercises } = handler
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

    const exercise = exercises[index]
    const { sets, reps } = exercise

    if (currExercise.current === index) {
      applyCurrentExerciseSettings({ reps, sets })
      notify.success({
        key: 'toast.settingsAppliedCurrent',
        ns: 'patient-dashboard',
      })
    }

    if (isProgramActive)
      selectedDevice?.events.program.SettingsChange(toSettingsPayload(exercise))
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

    setExercises(syncedExercises)
    if (isProgramActive) {
      // The headset applies one exercise per SettingsChange.
      for (const exercise of syncedExercises) {
        selectedDevice?.events.program.SettingsChange(
          toSettingsPayload(exercise),
        )
      }
    }
    if (exercises[currExercise.current]) {
      applyCurrentExerciseSettings({ reps, sets })
    }
    notify.success({
      key: 'toast.settingsAppliedAll',
      ns: 'patient-dashboard',
    })
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
