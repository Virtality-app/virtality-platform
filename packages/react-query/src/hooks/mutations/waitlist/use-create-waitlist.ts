import { useMutation } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.tsx'

export function useCreateWaitlist() {
  const orpc = useORPC()
  return useMutation(orpc.waitlist.create.mutationOptions())
}
