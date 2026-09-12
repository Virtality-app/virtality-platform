import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import type { ImmersiveVideoAdminRow } from '@virtality/orpc/client'
import { useORPC } from '../../../orpc-context.js'

type AdminRowMutation<TInput> = UseMutationResult<
  ImmersiveVideoAdminRow,
  Error,
  TInput
>

function useInvalidateImmersiveVideoCatalog() {
  const orpc = useORPC()
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({
      queryKey: orpc.immersiveVideo.listCatalog.key(),
    })
}

export function useCreateImmersiveVideo() {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.create.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useUpdateImmersiveVideo(): AdminRowMutation<{
  id: string
  title?: string
  activity?: 'CYCLING' | 'WALKING'
  description?: string | null
}> {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.update.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useSetImmersiveVideoThumbnail() {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.setThumbnail.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useDiscardImmersiveVideoIfEmpty() {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.discardIfEmpty.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function usePublishImmersiveVideo(): AdminRowMutation<{ id: string }> {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.publish.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useUnpublishImmersiveVideo(): AdminRowMutation<{
  id: string
}> {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.unpublish.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useDeleteImmersiveVideo() {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.delete.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useStartImmersiveVideoUpload() {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.upload.start.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useUploadImmersiveVideoPart() {
  const orpc = useORPC()
  return useMutation(orpc.immersiveVideo.upload.part.mutationOptions())
}

export function useCompleteImmersiveVideoUpload(): AdminRowMutation<{
  id: string
}> {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.upload.complete.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}

export function useAbortImmersiveVideoUpload(): AdminRowMutation<{
  id: string
}> {
  const orpc = useORPC()
  const invalidate = useInvalidateImmersiveVideoCatalog()
  return useMutation(
    orpc.immersiveVideo.upload.abort.mutationOptions({
      onSuccess: () => invalidate(),
    }),
  )
}
