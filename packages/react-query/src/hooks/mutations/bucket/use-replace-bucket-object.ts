import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type ReplaceBucketMutationOptions = ReturnType<
  ORPCUtils['bucket']['replace']['mutationOptions']
>
type ReplaceBucketOnSuccess = NonNullable<
  ReplaceBucketMutationOptions['onSuccess']
>

interface UseReplaceBucketObjectProps {
  onSuccess?: ReplaceBucketOnSuccess
}

export function useReplaceBucketObject({
  onSuccess,
}: UseReplaceBucketObjectProps = {}) {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.bucket.replace.mutationOptions({
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: orpc.bucket.list.key() })
        onSuccess?.(...args)
      },
    }),
  )
}
