'use client'
import { Button } from '@virtality/ui/components/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import type { ActivePendingAccountDeletion } from '@virtality/react-query'
import { useClientT } from '@/i18n/use-client-t'
import { PendingAccountDeletionState } from './profile-pending-account-deletion-state'

export const DeleteAccountCard = ({
  isLoading,
  pending,
  isStarting,
  onDelete,
}: {
  isLoading: boolean
  pending: ActivePendingAccountDeletion | null | undefined
  isStarting: boolean
  onDelete: () => void
}) => {
  const { t } = useClientT(['user', 'common'])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.deleteAccount.title')}</CardTitle>
      </CardHeader>
      {isLoading ? null : pending ? (
        <PendingAccountDeletionState pending={pending} />
      ) : (
        <>
          <CardContent>{t('profile.deleteAccount.description')}</CardContent>
          <CardFooter className='border-t'>
            <Button
              type='submit'
              variant='destructive'
              onClick={onDelete}
              disabled={isStarting}
              className='ml-auto'
            >
              {isStarting
                ? t('profile.deleteAccount.starting')
                : t('profile.deleteAccount.action')}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
