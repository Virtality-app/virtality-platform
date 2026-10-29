'use client'
import { Button } from '@virtality/ui/components/button'
import { notify } from '@/lib/notify'
import { CardContent, CardFooter } from '@virtality/ui/components/card'
import {
  type ActivePendingAccountDeletion,
  useCancelPendingAccountDeletion,
  useORPC,
  useResendPendingAccountDeletion,
} from '@virtality/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useClientT } from '@/i18n/use-client-t'
import { translateRich } from '@/i18n/translate-rich'
import { invalidateActivePendingAccountDeletion } from './profile-info-form'

export const PendingAccountDeletionState = ({
  pending,
}: {
  pending: ActivePendingAccountDeletion
}) => {
  const { t, i18n } = useClientT(['user', 'common'])
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const { destinationEmail, expiresAt } = pending
  const expiry = new Date(expiresAt)

  const { mutate: resend, isPending: isResending } =
    useResendPendingAccountDeletion({
      onSuccess: async () => {
        await invalidateActivePendingAccountDeletion(queryClient, orpc)
        notify.success({ key: 'profile.toast.approvalResent', ns: 'user' })
      },
      onError: (error) => {
        console.error(error)
        notify.error({ key: 'profile.toast.approvalResendFailed', ns: 'user' })
      },
    })

  const { mutate: cancel, isPending: isCancelling } =
    useCancelPendingAccountDeletion({
      onSuccess: async () => {
        await invalidateActivePendingAccountDeletion(queryClient, orpc)
        notify.success({ key: 'profile.toast.deletionCancelled', ns: 'user' })
      },
      onError: (error) => {
        console.error(error)
        notify.error({
          key: 'profile.toast.deletionCancelFailed',
          ns: 'user',
        })
      },
    })

  const isActionPending = isResending || isCancelling

  return (
    <>
      <CardContent className='space-y-2'>
        <p className='text-sm'>
          {translateRich(t, 'profile.pending.accountDeletionApproval', {
            email: <span className='font-medium'>{destinationEmail}</span>,
          })}
        </p>
        <p className='text-muted-foreground text-sm'>
          {t('profile.pending.expires', {
            date: expiry.toLocaleString(i18n.language),
          })}
        </p>
      </CardContent>
      <CardFooter className='flex gap-2 border-t'>
        <Button
          type='button'
          variant='outline'
          disabled={isActionPending}
          onClick={() => cancel(undefined)}
        >
          {isCancelling
            ? t('profile.pending.cancelling')
            : t('profile.pending.cancelRequest')}
        </Button>
        <Button
          type='button'
          variant='destructive'
          className='ml-auto'
          disabled={isActionPending}
          onClick={() => resend(undefined)}
        >
          {isResending
            ? t('profile.pending.resending')
            : t('profile.pending.resendEmail')}
        </Button>
      </CardFooter>
    </>
  )
}
