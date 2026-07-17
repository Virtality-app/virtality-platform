import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../../orpc-context.js'

export function useUpdatePartnerLogo() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  return useMutation(
    orpc.partnerLogo.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.partnerLogo.list.key(),
        })
      },
    }),
  )
}
