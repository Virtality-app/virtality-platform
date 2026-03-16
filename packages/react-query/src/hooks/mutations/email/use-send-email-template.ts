import { useMutation } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.tsx'

export const useSendEmailTemplate = () => {
  const orpc = useORPC()
  return useMutation(orpc.email.templates.send.mutationOptions())
}

