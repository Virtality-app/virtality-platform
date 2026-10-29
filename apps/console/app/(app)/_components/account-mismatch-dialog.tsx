'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@virtality/ui/components/button'
import { useClientT } from '@/i18n/use-client-t'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ACCOUNT_MISMATCH_NOTICE_PARAM,
  ACCOUNT_MISMATCH_NOTICE_VALUE,
} from '@/lib/account-mismatch'

const AccountMismatchDialogInner = () => {
  const { t } = useClientT(['home', 'common'])
  const router = useRouter()
  const searchParams = useSearchParams()
  const open =
    searchParams.get(ACCOUNT_MISMATCH_NOTICE_PARAM) ===
    ACCOUNT_MISMATCH_NOTICE_VALUE

  const dismiss = () => router.replace('/')

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('accountMismatch.title')}</DialogTitle>
          <DialogDescription>
            {t('accountMismatch.description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type='button' variant='primary' onClick={dismiss}>
            {t('accountMismatch.dismiss')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const AccountMismatchDialog = () => (
  <Suspense fallback={null}>
    <AccountMismatchDialogInner />
  </Suspense>
)

export default AccountMismatchDialog
