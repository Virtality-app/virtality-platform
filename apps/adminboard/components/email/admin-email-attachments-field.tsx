'use client'

import { Button } from '@/components/ui/button'
import {
  ADMIN_EMAIL_ATTACHMENT_ACCEPT,
  ADMIN_EMAIL_ATTACHMENT_MAX_COUNT,
  ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES,
  formatAdminEmailAttachmentSize,
} from '@virtality/shared/utils'
import { Label } from '@virtality/ui/components/label'
import { Paperclip } from 'lucide-react'
import { useRef } from 'react'
import { AdminEmailAttachmentList } from './admin-email-attachment-list'
import { useAdminEmailAttachments } from './use-admin-email-attachments'
import type { DraftAttachment } from './use-admin-email-draft-actions'

type AdminEmailAttachmentsFieldProps = {
  draftId: string
  attachments: DraftAttachment[]
  saveIfDirty: () => Promise<boolean>
  disabled: boolean
}

/** Attach, list and remove the files sent with one draft. */
export const AdminEmailAttachmentsField = ({
  draftId,
  attachments,
  saveIfDirty,
  disabled,
}: AdminEmailAttachmentsFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { add, remove, isAdding, removingId } = useAdminEmailAttachments({
    draftId,
    attachments,
    saveIfDirty,
  })

  const totalSize = attachments.reduce((sum, { size }) => sum + size, 0)
  const isFull = attachments.length >= ADMIN_EMAIL_ATTACHMENT_MAX_COUNT

  if (disabled && attachments.length === 0) {
    return null
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <Label className='text-muted-foreground text-sm font-medium'>
            Attachments
          </Label>
          <p className='text-muted-foreground text-xs'>
            PDF or images, up to {ADMIN_EMAIL_ATTACHMENT_MAX_COUNT} files and{' '}
            {formatAdminEmailAttachmentSize(
              ADMIN_EMAIL_ATTACHMENT_MAX_TOTAL_BYTES,
            )}{' '}
            in total
            {attachments.length > 0
              ? ` · ${formatAdminEmailAttachmentSize(totalSize)} used`
              : ''}
            .
          </p>
        </div>
        {disabled ? null : (
          <>
            <input
              ref={inputRef}
              type='file'
              multiple
              hidden
              accept={ADMIN_EMAIL_ATTACHMENT_ACCEPT}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                event.target.value = ''
                void add(files)
              }}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isAdding || isFull}
              onClick={() => inputRef.current?.click()}
            >
              <Paperclip className='mr-2 size-4' />
              {isAdding ? 'Uploading…' : 'Attach files'}
            </Button>
          </>
        )}
      </div>
      <AdminEmailAttachmentList
        attachments={attachments}
        onRemove={disabled ? undefined : (id) => void remove(id)}
        removingId={removingId}
        disabled={isAdding}
      />
    </div>
  )
}
