/**
 * Confirm dialog for clinician self-remove of a promo Discount (#73).
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

type RemovePromoConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotionCode: string | null
  onConfirm: () => void
  confirming?: boolean
}

export function RemovePromoConfirmDialog({
  open,
  onOpenChange,
  promotionCode,
  onConfirm,
  confirming = false,
}: RemovePromoConfirmDialogProps) {
  const { t } = useClientT(['user', 'common'])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!confirming}>
        <DialogHeader>
          <DialogTitle>{t('billing.promo.removeTitle')}</DialogTitle>
          <DialogDescription asChild>
            <div className='space-y-3 pt-1 text-sm text-zinc-500'>
              {promotionCode ? (
                <p>
                  {translateRich(t, 'billing.promo.removeBodyWithCode', {
                    code: (
                      <span className='font-mono font-medium text-zinc-800 dark:text-zinc-200'>
                        {promotionCode}
                      </span>
                    ),
                  })}
                </p>
              ) : (
                <p>{t('billing.promo.removeBody')}</p>
              )}
              <p>
                {t('billing.promo.removeNextInvoice', {
                  timing: t('billing.discountTiming'),
                })}
              </p>
              <p>{t('billing.removeNoRestore')}</p>
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
            variant='destructive'
            disabled={confirming}
            onClick={onConfirm}
          >
            {confirming
              ? t('billing.promo.removing')
              : t('billing.promo.removeDiscount')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
