import { useRef } from 'react'
import { Store } from 'tinybase'
import { CompleteExercise, ProgressDataPoint } from '@/types/models'
import { getDisplayName } from '@/lib/utils'

interface RecordRepProgressInput {
  exercise: CompleteExercise
  progress: number
  progressByExerciseId: Record<string, ProgressDataPoint[]> | null
  currentExerciseProgress: ProgressDataPoint[]
}

const usePatientLocalProgress = (patientId: string, store?: Store) => {
  const stats = useRef({ highscore: 0, bestExercise: '' })

  const recordRepProgress = ({
    exercise,
    progress,
    progressByExerciseId,
    currentExerciseProgress,
  }: RecordRepProgressInput) => {
    if (stats.current.highscore < progress) {
      stats.current.highscore = progress
      stats.current.bestExercise = getDisplayName(exercise.exercise) ?? ''
    }

    store?.setCell(
      'patients',
      patientId,
      'progress',
      JSON.stringify({
        ...progressByExerciseId,
        [exercise.exerciseId]: currentExerciseProgress,
      }),
    )

    store?.setCell('patients', patientId, 'highscore', stats.current.highscore)
    store?.setCell(
      'patients',
      patientId,
      'bestExercise',
      stats.current.bestExercise,
    )
  }

  return { recordRepProgress }
}

export default usePatientLocalProgress
