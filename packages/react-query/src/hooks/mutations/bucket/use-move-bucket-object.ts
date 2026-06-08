import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ORPCUtils } from '../../../orpc.js'
import { useORPC } from '../../../orpc-context.js'

type MoveBucketMutationOptions = ReturnType<
  ORPCUtils['bucket']['move']['mutationOptions']
>
type MoveBucketOnSuccess = NonNullable<MoveBucketMutationOptions['onSuccess']>

interface UseMoveBucketObjectProps {
  onSuccess?: MoveBucketOnSuccess
}

export function useMoveBucketObject({
  onSuccess,
}: UseMoveBucketObjectProps = {}) {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.bucket.move.mutationOptions({
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: orpc.bucket.list.key() })
        onSuccess?.(...args)
      },
    }),
  )
}
