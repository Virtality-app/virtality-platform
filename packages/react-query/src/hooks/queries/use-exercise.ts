import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../orpc-context.js'
import { ExerciseFindManyZodSchema } from '@virtality/db/definitions'
import { z } from 'zod/v4'

type ExerciseListInput = z.infer<typeof ExerciseFindManyZodSchema> & {
  includeDisabled?: boolean
}

interface UseExerciseProps {
  input?: ExerciseListInput
  includeDisabled?: boolean
}

export function useExercise({ input, includeDisabled }: UseExerciseProps = {}) {
  const orpc = useORPC()
  return useQuery(
    orpc.exercise.list.queryOptions({
      input: { ...input, includeDisabled },
      staleTime: 'static',
    }),
  )
}
