import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.tsx'

type CreateWaitlistInput = {
  email: string
}

type CreateWaitlistResult =
  | { success: true; message: null }
  | { success: false; message: string }

export function useCreateWaitlist(): UseMutationResult<
  CreateWaitlistResult,
  Error,
  CreateWaitlistInput
> {
  const orpc = useORPC()
  return useMutation(orpc.waitlist.create.mutationOptions())
}
