import { skipToken, useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

interface UseIsUserVerifiedProps {
  email: string | null
}

export function useIsUserVerified({ email }: UseIsUserVerifiedProps) {
  const orpc = useORPC()
  return useQuery(
    orpc.user.isUserVerified.queryOptions({
      input: email ? { email } : skipToken,
    }),
  )
}
