'use client'

import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useClientT } from '@/i18n/use-client-t'
import { useExpiredFreeUpgradePrompt } from '@/hooks/use-expired-free-upgrade-prompt'
import { profileBillingHref } from '@/lib/renew-prompt-dismiss'

/**
 * Dismissible upgrade dialog for clinicians on expired Free or canceled seats.
 * Deep-links to Profile Billing and does not block non-launch Console use.
 */
export function ExpiredFreeUpgradeDialog() {
  const { t } = useClientT('layout')
  const { open, dismiss, userId } = useExpiredFreeUpgradePrompt()

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) dismiss()
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('expiredUpgrade.title')}</DialogTitle>
          <DialogDescription>
            {t('expiredUpgrade.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={dismiss}>
            {t('expiredUpgrade.notNow')}
          </Button>
          {userId && (
            <Button asChild variant='primary'>
              <Link href={profileBillingHref(userId)} onClick={dismiss}>
                <CreditCard />
                {t('expiredUpgrade.viewPlans')}
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
