'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatAdminEmailAttachmentSize } from '@virtality/shared/utils'
import { Input } from '@virtality/ui/components/input'
import type { DraftAttachment } from './use-admin-email-draft-actions'

export type FinalSendBreakdown = {
  explicitCount: number
  audienceCount: number
  audienceName: string | null
  overlapCount: number
  suppressedCount: number
  totalCount: number
}

type FinalSendDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: string
  topicLabel: string
  /** Resolved at open time; null while resolving. */
  breakdown: FinalSendBreakdown | null
  attachments: DraftAttachment[]
  confirmedSubject: string
  onConfirmedSubjectChange: (value: string) => void
  onConfirm: () => void
  isPending: boolean
}

export const FinalSendDialog = ({
  open,
  onOpenChange,
  subject,
  topicLabel,
  breakdown,
  attachments,
  confirmedSubject,
  onConfirmedSubjectChange,
  onConfirm,
  isPending,
}: FinalSendDialogProps) => {
  const attachmentBytes = attachments.reduce((sum, { size }) => sum + size, 0)
  const subjectMatches = confirmedSubject === subject
  const recipientCount = breakdown?.totalCount ?? 0
  const canConfirm =
    subjectMatches && breakdown !== null && recipientCount > 0 && !isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm final send</DialogTitle>
          <DialogDescription>
            Final send is immediate and irreversible. Confirm the subject and
            recipient count before sending.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='rounded-lg border p-4 text-sm'>
            <p>
              <span className='text-muted-foreground'>Recipients:</span>{' '}
              <span className='font-medium'>
                {breakdown ? recipientCount : 'Resolving...'}
              </span>
            </p>
            {breakdown ? (
              <p className='text-muted-foreground mt-1 text-xs'>
                {breakdown.explicitCount} explicit
                {breakdown.audienceName
                  ? ` + ${breakdown.audienceCount} from ${breakdown.audienceName}`
                  : ''}
                {breakdown.overlapCount > 0
                  ? ` − ${breakdown.overlapCount} in both`
                  : ''}
                {` − ${breakdown.suppressedCount} opted out`}
              </p>
            ) : null}
            <p className='mt-2'>
              <span className='text-muted-foreground'>Topic:</span>{' '}
              <span className='font-medium'>{topicLabel}</span>
            </p>
            <p className='mt-2'>
              <span className='text-muted-foreground'>Subject:</span>{' '}
              <span className='font-medium'>{subject || '(empty)'}</span>
            </p>
            {attachments.length > 0 ? (
              <p className='mt-2'>
                <span className='text-muted-foreground'>Attachments:</span>{' '}
                <span className='font-medium'>
                  {attachments.length} (
                  {formatAdminEmailAttachmentSize(attachmentBytes)}) with every
                  email
                </span>
                {breakdown ? (
                  <span className='text-muted-foreground block text-xs'>
                    About{' '}
                    {formatAdminEmailAttachmentSize(
                      // Base64 encoding in the email adds about a third.
                      Math.ceil((attachmentBytes * 4) / 3) * recipientCount,
                    )}{' '}
                    of mail in total.
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>

          <div>
            <label className='text-muted-foreground text-sm font-medium'>
              Re-type the subject to confirm
            </label>
            <Input
              className='mt-1'
              value={confirmedSubject}
              onChange={(event) => onConfirmedSubjectChange(event.target.value)}
              placeholder={subject}
            />
            {!subjectMatches && confirmedSubject.length > 0 ? (
              <p className='mt-1 text-sm text-red-600'>
                Subject must match exactly.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={!canConfirm}>
            {isPending ? 'Sending...' : 'Send now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
