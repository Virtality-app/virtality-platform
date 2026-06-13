import { skipToken, useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

interface UseReusableProgramProps {
  id?: string
}

export function useReusableProgram({ id }: UseReusableProgramProps) {
  const orpc = useORPC()
  return useQuery(
    orpc.reusableProgram.find.queryOptions({
      input: id ? { id } : skipToken,
    }),
  )
}
