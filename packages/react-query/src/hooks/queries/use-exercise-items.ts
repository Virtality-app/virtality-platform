import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../orpc-context.js'

export function useExerciseItems() {
  const orpc = useORPC()

  return useQuery(
    orpc.exercise.listItems.queryOptions({
      staleTime: 'static',
    }),
  )
}
