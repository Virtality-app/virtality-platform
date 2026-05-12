import { useMutation } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'
import { ORPCUtils } from '../../../orpc.ts'

type UseUpdateUserInfoProps = ReturnType<
  ORPCUtils['user']['updateInfo']['mutationOptions']
>

export function useUpdateUserInfo(props: UseUpdateUserInfoProps) {
  const orpc = useORPC()
  return useMutation(orpc.user.updateInfo.mutationOptions({ ...props }))
}
