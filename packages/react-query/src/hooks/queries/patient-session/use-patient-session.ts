import { skipToken, useQuery } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

interface UsePatientSessionProps {
  sessionId?: string
}

export function usePatientSession({ sessionId }: UsePatientSessionProps) {
  const orpc = useORPC()
  return useQuery(
    orpc.patientSession.find.queryOptions({
      input:
        sessionId || sessionId !== ''
          ? { where: { id: sessionId } }
          : skipToken,
    }),
  )
}
