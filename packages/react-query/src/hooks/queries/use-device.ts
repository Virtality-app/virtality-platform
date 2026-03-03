import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '../../orpc-context.js'

/**
 * Core device hook: device list query + create/delete mutations with cache invalidation.
 * For socket/VRDevice logic, wrap or extend this in the app (e.g. console).
 */
export function useDeviceCore() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(orpc.device.list.queryOptions())

  const createDevice = useMutation(
    orpc.device.create.mutationOptions({
      onError: (error: unknown) => {
        console.error(error)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.device.list.key() })
      },
    }),
  )

  const removeDevice = useMutation(
    orpc.device.delete.mutationOptions({
      onError: (error: unknown) => {
        console.error(error)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.device.list.key() })
      },
    }),
  )

  return {
    data,
    isLoading,
    createDevice,
    removeDevice,
  }
}
