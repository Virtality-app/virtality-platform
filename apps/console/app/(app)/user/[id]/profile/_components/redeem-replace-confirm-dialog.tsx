/**
 * Confirm dialog when redeeming a Promotion Code over campaign/prior promo.
 */

'use client'

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
import { translateRich } from '@/i18n/translate-rich'

type RedeemReplaceConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  code: string
  currentLabel: string | null
  onConfirm: () => void
  confirming?: boolean
}

export function RedeemReplaceConfirmDialog({
  open,
  onOpenChange,
  code,
  currentLabel,
  onConfirm,
  confirming = false,
}: RedeemReplaceConfirmDialogProps) {
  const { t } = useClientT(['user', 'common'])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!confirming}>
        <DialogHeader>
          <DialogTitle>{t('billing.promo.replaceTitle')}</DialogTitle>
          <DialogDescription asChild>
            <div className='space-y-3 pt-1 text-sm text-zinc-500'>
              <p>
                {translateRich(
                  t,
                  currentLabel
                    ? 'billing.promo.replaceBody'
                    : 'billing.promo.replaceBodyNoCurrent',
                  {
                    code: (
                      <span className='font-mono font-medium text-zinc-800 dark:text-zinc-200'>
                        {code}
                      </span>
                    ),
                    current: (
                      <span className='font-medium text-zinc-800 dark:text-zinc-200'>
                        {currentLabel}
                      </span>
                    ),
                  },
                )}
              </p>
              <p>{t('billing.discountTiming')}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline' disabled={confirming}>
              {t('common:btn.cancel')}
            </Button>
          </DialogClose>
          <Button
            type='button'
            variant='primary'
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming
              ? t('billing.promo.applying')
              : t('billing.promo.replaceDiscount')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
