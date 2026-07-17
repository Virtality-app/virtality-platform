import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useRemovePartnerLogo() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.partnerLogo.remove.mutationOptions({
      onSuccess: (outcome) => {
        queryClient.invalidateQueries({
          queryKey: orpc.partnerLogo.list.key(),
        })

        if (outcome.bucketObjectDeleted) {
          queryClient.invalidateQueries({
            queryKey: orpc.bucket.list.key(),
          })
        }
      },
    }),
  )
}
