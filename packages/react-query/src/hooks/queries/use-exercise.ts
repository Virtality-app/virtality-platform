import { useQuery } from '@tanstack/react-query'
import { useORPC } from '../../orpc-context.js'

export function useExercise() {
  const orpc = useORPC()
  return useQuery(orpc.exercise.list.queryOptions({ staleTime: 'static' }))
}
