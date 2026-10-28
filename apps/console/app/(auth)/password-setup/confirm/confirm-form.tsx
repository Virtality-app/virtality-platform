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
  useApprovePendingPasswordChange,
  useInspectPendingPasswordChange,
  useORPC,
} from '@virtality/react-query'
import { useQueryClient } from '@tanstack/react-query'
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

const PasswordSetupConfirmForm = ({ token }: { token?: string }) => {
  const router = useRouter()
  const { t } = useClientT(['auth', 'common'])
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const { data: session } = authClient.useSession()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isApproved, setIsApproved] = useState(false)

  const {
    mutate: inspect,
    data: inspectResult,
    isPending: isInspecting,
  } = useInspectPendingPasswordChange()

  const { mutate: approve, isPending: isApproving } =
    useApprovePendingPasswordChange({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.user.hasPassword.key(),
        })
        await queryClient.invalidateQueries({
          queryKey: orpc.pendingPasswordChange.getActive.key(),
        })
        setIsApproved(true)
        setErrorMessage(null)
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

  const isChange = inspectResult.kind === 'CHANGE'
  const returnNavigation = getReturnNavigation(session, true)

  if (isApproved) {
    return (
      <Card className='w-full max-w-lg'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold'>
            {isChange
              ? t('passwordSetup.changedTitle')
              : t('passwordSetup.setTitle')}
          </CardTitle>
          <CardDescription>
            {isChange
              ? t('passwordSetup.changedDescription')
              : t('passwordSetup.setDescription')}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            className='ml-auto'
            onClick={() => router.push(returnNavigation.href)}
          >
            {t(returnNavigation.labelKey)}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='w-full max-w-lg'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          {isChange
            ? t('passwordSetup.approveChangeTitle')
            : t('passwordSetup.approveSetupTitle')}
        </CardTitle>
        <CardDescription>
          {isChange
            ? t('passwordSetup.confirmChange')
            : t('passwordSetup.confirmSetup')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage ? (
          <p className='text-destructive text-sm'>{errorMessage}</p>
        ) : (
          <p className='text-muted-foreground text-sm'>
            {isChange
              ? t('passwordSetup.pressApproveChange')
              : t('passwordSetup.pressApproveSetup')}
          </p>
        )}
      </CardContent>
      <CardFooter className='flex gap-2'>
        <Button asChild variant='outline'>
          <Link href={returnNavigation.href}>{t('common:btn.cancel')}</Link>
        </Button>
        <Button
          className='ml-auto'
          disabled={isApproving}
          onClick={() => approve({ token })}
        >
          {isApproving
            ? t('passwordSetup.approving')
            : t('passwordSetup.approve')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PasswordSetupConfirmForm
