import { useMutation } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type CreatePatientSessionExercisesOnSuccess = ReturnType<
  ORPCUtils['patientSessionExercise']['createMany']['mutationOptions']
>['onSuccess']

interface UseCreatePatientSessionExercisesProps {
  onSuccess?: CreatePatientSessionExercisesOnSuccess
}

export function useCreatePatientSessionExercises({
  onSuccess,
}: UseCreatePatientSessionExercisesProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.patientSessionExercise.createMany.mutationOptions({ onSuccess }),
  )
}
