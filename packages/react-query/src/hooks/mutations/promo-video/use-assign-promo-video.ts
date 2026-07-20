import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useAssignPromoVideo() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.promoVideo.assign.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.promoVideo.get.key(),
        })
      },
    }),
  )
}
