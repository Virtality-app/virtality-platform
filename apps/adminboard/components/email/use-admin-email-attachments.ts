import { getErrorMessage } from '@/lib/get-error-message'
import {
  useAddAdminEmailAttachment,
  useRemoveAdminEmailAttachment,
} from '@virtality/react-query'
import {
  ADMIN_EMAIL_ATTACHMENT_CONTENT_TYPES,
  validateAdminEmailAttachmentAddition,
} from '@virtality/shared/utils'
import { toast } from 'sonner'
import type { DraftAttachment } from './use-admin-email-draft-actions'

type UseAdminEmailAttachmentsInput = {
  draftId: string
  attachments: DraftAttachment[]
  /** Uploading refreshes the draft, so unsaved edits are saved first. */
  saveIfDirty: () => Promise<boolean>
}

const isAllowedType = (type: string) =>
  (ADMIN_EMAIL_ATTACHMENT_CONTENT_TYPES as readonly string[]).includes(type)

/**
 * Upload and remove for one draft's attachments. The checks here only spare a
 * doomed upload; the server checks the file's real type and the limits again.
 */
export const useAdminEmailAttachments = ({
  draftId,
  attachments,
  saveIfDirty,
}: UseAdminEmailAttachmentsInput) => {
  const addMutation = useAddAdminEmailAttachment()
  const removeMutation = useRemoveAdminEmailAttachment()

  const add = async (files: File[]) => {
    if (files.length === 0 || !(await saveIfDirty())) {
      return
    }

    const sizes = attachments.map((attachment) => attachment.size)

    for (const file of files) {
      if (!isAllowedType(file.type)) {
        toast.error(`${file.name}: only PDF and image files can be attached`)
        continue
      }

      const limitError = validateAdminEmailAttachmentAddition({
        existingSizes: sizes,
        newSize: file.size,
      })
      if (limitError) {
        toast.error(`${file.name}: ${limitError}`)
        continue
      }

      try {
        await addMutation.mutateAsync({ draftId, file })
        sizes.push(file.size)
      } catch (error) {
        toast.error(getErrorMessage(error, `Failed to attach ${file.name}`))
      }
    }
  }

  const remove = async (attachmentId: string) => {
    if (!(await saveIfDirty())) {
      return
    }

    try {
      await removeMutation.mutateAsync({ draftId, attachmentId })
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to remove attachment'))
    }
  }

  return {
    add,
    remove,
    isAdding: addMutation.isPending,
    removingId: removeMutation.isPending
      ? removeMutation.variables?.attachmentId
      : undefined,
  }
}
