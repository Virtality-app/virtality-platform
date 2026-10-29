'use client'
import { Button } from '@virtality/ui/components/button'
import { notify } from '@/lib/notify'
import { CardContent, CardFooter } from '@virtality/ui/components/card'
import {
  type ActivePendingPasswordChange,
  useCancelPendingPasswordChange,
  useORPC,
  useResendPendingPasswordChange,
} from '@virtality/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useClientT } from '@/i18n/use-client-t'
import { translateRich } from '@/i18n/translate-rich'
import { invalidateActivePendingPasswordChange } from './profile-info-form'

const PENDING_PASSWORD_KIND_LABEL = {
  SETUP: 'profile.password.setup',
  CHANGE: 'profile.password.change',
} as const satisfies Record<ActivePendingPasswordChange['kind'], string>

const PENDING_PASSWORD_CANCEL_SUCCESS = {
  SETUP: 'profile.toast.passwordSetupCancelled',
  CHANGE: 'profile.toast.passwordChangeCancelled',
} as const satisfies Record<ActivePendingPasswordChange['kind'], string>

export const PendingPasswordState = ({
  pending,
}: {
  pending: ActivePendingPasswordChange
}) => {
  const { t, i18n } = useClientT(['user', 'common'])
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const { kind, destinationEmail, expiresAt } = pending
  const expiry = new Date(expiresAt)

  const { mutate: resend, isPending: isResending } =
    useResendPendingPasswordChange({
      onSuccess: async () => {
        await invalidateActivePendingPasswordChange(queryClient, orpc)
        notify.success({ key: 'profile.toast.approvalResent', ns: 'user' })
      },
      onError: (error) => {
        console.error(error)
        notify.error({ key: 'profile.toast.approvalResendFailed', ns: 'user' })
      },
    })

  const { mutate: cancel, isPending: isCancelling } =
    useCancelPendingPasswordChange({
      onSuccess: async () => {
        await invalidateActivePendingPasswordChange(queryClient, orpc)
        notify.success({
          key: PENDING_PASSWORD_CANCEL_SUCCESS[kind],
          ns: 'user',
        })
      },
      onError: (error) => {
        console.error(error)
        notify.error({
          key: 'profile.toast.passwordCancelFailed',
          ns: 'user',
        })
      },
    })

  const isActionPending = isResending || isCancelling

  return (
    <>
      <CardContent className='space-y-2'>
        <p className='text-sm'>
          {translateRich(
            t,
            'profile.pending.approval',
            {
              email: <span className='font-medium'>{destinationEmail}</span>,
            },
            { what: t(PENDING_PASSWORD_KIND_LABEL[kind]) },
          )}
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
