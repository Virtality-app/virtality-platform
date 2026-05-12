import { useMutation } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.tsx'
import { ORPCUtils } from '../../../orpc.ts'

type UseUpdateUserEmailProps = ReturnType<
  ORPCUtils['user']['updateEmail']['mutationOptions']
>

export function useUpdateUserEmail(props: UseUpdateUserEmailProps) {
  const orpc = useORPC()
  return useMutation(orpc.user.updateEmail.mutationOptions({ ...props }))
}
