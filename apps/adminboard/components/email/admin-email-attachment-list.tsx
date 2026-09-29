'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatAdminEmailAttachmentSize } from '@virtality/shared/utils'
import { FileText, ImageIcon, X } from 'lucide-react'
import type { DraftAttachment } from './use-admin-email-draft-actions'

type AdminEmailAttachmentListProps = {
  attachments: DraftAttachment[]
  /** Omit for a read-only list. */
  onRemove?: (attachmentId: string) => void
  removingId?: string
  disabled?: boolean
  className?: string
}

/** Attached files, each opening in a new tab, optionally removable. */
export const AdminEmailAttachmentList = ({
  attachments,
  onRemove,
  removingId,
  disabled,
  className,
}: AdminEmailAttachmentListProps) => {
  if (attachments.length === 0) {
    return null
  }

  return (
    <ul className={cn('divide-y rounded-lg border text-sm', className)}>
      {attachments.map((attachment) => {
        const Icon = attachment.contentType.startsWith('image/')
          ? ImageIcon
          : FileText

        return (
          <li key={attachment.id} className='flex items-center gap-3 px-3 py-2'>
            <Icon className='text-muted-foreground size-4 shrink-0' />
            <a
              href={attachment.url}
              target='_blank'
              rel='noreferrer'
              className='min-w-0 flex-1 truncate hover:underline'
            >
              {attachment.filename}
            </a>
            <span className='text-muted-foreground shrink-0 font-mono text-xs tabular-nums'>
              {formatAdminEmailAttachmentSize(attachment.size)}
            </span>
            {onRemove ? (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 shrink-0'
                aria-label={`Remove ${attachment.filename}`}
                disabled={disabled || removingId === attachment.id}
                onClick={() => onRemove(attachment.id)}
              >
                <X className='size-4' />
              </Button>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
