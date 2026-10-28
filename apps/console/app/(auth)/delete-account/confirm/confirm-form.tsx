'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@virtality/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { authClient } from '@/auth-client'
import {
  useApprovePendingAccountDeletion,
  useInspectPendingAccountDeletion,
} from '@virtality/react-query'
import { useClientT } from '@/i18n/use-client-t'

type Session = ReturnType<typeof authClient.useSession>['data']

const getReturnNavigation = (
  session: Session,
  canReturnToProfile: boolean,
): { href: string; labelKey: string } => {
  if (canReturnToProfile && session?.user) {
    return {
      href: `/user/${session.user.id}/profile`,
      labelKey: 'approval.backToProfile',
    }
  }

  return { href: '/sign-in', labelKey: 'approval.signIn' }
}

const InvalidLinkCard = ({
  session,
  canReturnToProfile,
}: {
  session: Session
  canReturnToProfile: boolean
}) => {
  const { t } = useClientT(['auth', 'common'])
  const returnNavigation = getReturnNavigation(session, canReturnToProfile)

  return (
    <Card className='w-full max-w-lg'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          {t('approval.invalidTitle')}
        </CardTitle>
        <CardDescription>{t('approval.invalidMessage')}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild className='ml-auto'>
          <Link href={returnNavigation.href}>
            {t(returnNavigation.labelKey)}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

const DeleteAccountConfirmForm = ({ token }: { token?: string }) => {
  const router = useRouter()
  const { t } = useClientT(['auth', 'common'])
  const { data: session } = authClient.useSession()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    mutate: inspect,
    data: inspectResult,
    isPending: isInspecting,
  } = useInspectPendingAccountDeletion()

  const { mutate: approve, isPending: isApproving } =
    useApprovePendingAccountDeletion({
      onSuccess: async () => {
        setErrorMessage(null)
        await authClient.signOut()
        router.push('/goodbye')
      },
      onError: () => {
        setErrorMessage(t('approval.invalidMessage'))
      },
    })

  useEffect(() => {
    if (!token) return
    inspect({ token })
  }, [inspect, token])

  if (!token) {
    return <InvalidLinkCard session={session} canReturnToProfile={false} />
  }

  if (isInspecting || inspectResult === undefined) {
    return (
      <Card className='w-full max-w-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            {t('approval.checkingTitle')}
          </CardTitle>
          <CardDescription>{t('approval.checkingDescription')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!inspectResult.valid) {
    return (
      <InvalidLinkCard
        session={session}
        canReturnToProfile={inspectResult.canReturnToProfile}
      />
    )
  }

  return (
    <Card className='w-full max-w-lg'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          {t('deleteAccount.title')}
        </CardTitle>
        <CardDescription>{t('deleteAccount.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage ? (
          <p className='text-destructive text-sm'>{errorMessage}</p>
        ) : (
          <p className='text-muted-foreground text-sm'>
            {t('deleteAccount.pressApprove')}
          </p>
        )}
      </CardContent>
      <CardFooter className='flex gap-2'>
        <Button asChild variant='outline'>
          <Link href={getReturnNavigation(session, true).href}>
            {t('common:btn.cancel')}
          </Link>
        </Button>
        <Button
          className='ml-auto'
          variant='destructive'
          disabled={isApproving}
          onClick={() => approve({ token })}
        >
          {isApproving
            ? t('deleteAccount.deleting')
            : t('deleteAccount.delete')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DeleteAccountConfirmForm
