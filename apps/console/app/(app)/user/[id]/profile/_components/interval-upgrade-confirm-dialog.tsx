'use client'

/**
 * Confirm scheduling a paid Default monthly ↔ yearly switch at period end.
 */

import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClientT } from '@/i18n/use-client-t'

type IntervalUpgradeConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  body: string
  confirmLabel: string
  confirming?: boolean
  onConfirm: () => void
}

export function IntervalUpgradeConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel,
  confirming = false,
  onConfirm,
}: IntervalUpgradeConfirmDialogProps) {
  const { t } = useClientT(['user', 'common'])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!confirming}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline' disabled={confirming}>
              {t('billing.confirm.keepCurrent')}
            </Button>
          </DialogClose>
          <Button
            type='button'
            variant='primary'
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming ? t('billing.action.upgrading') : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
