import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useSaveMosaic() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.mosaic.save.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.mosaic.get.key(),
        })
      },
    }),
  )
}
