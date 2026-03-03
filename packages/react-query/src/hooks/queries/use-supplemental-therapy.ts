import { useMutation, useQuery } from '@tanstack/react-query'
import type { ORPCUtils } from '../../orpc.js'
import { useORPC } from '../../orpc-context.js'

export function useSupplementalTherapyQuery() {
  const orpc = useORPC()
  return useQuery(orpc.supplementalTherapy.list.queryOptions())
}

type CreateSupplementalTherapyRelOnSuccess = ReturnType<
  ORPCUtils['supplementalTherapy']['createRel']['mutationOptions']
>['onSuccess']

interface UseCreateSupplementalTherapyRelMutationProps {
  onSuccess?: CreateSupplementalTherapyRelOnSuccess
}

export function useCreateSupplementalTherapyRelMutation({
  onSuccess,
}: UseCreateSupplementalTherapyRelMutationProps = {}) {
  const orpc = useORPC()
  return useMutation(
    orpc.supplementalTherapy.createRel.mutationOptions({ onSuccess }),
  )
}
