import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useReorderPartnerLogo() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.partnerLogo.reorder.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.partnerLogo.list.key(),
        })
      },
    }),
  )
}
