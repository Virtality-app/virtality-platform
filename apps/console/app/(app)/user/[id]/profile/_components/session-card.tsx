'use client'
import { UAParser } from 'ua-parser-js'
import { authClient, Session } from '@/auth-client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { Badge } from '@virtality/ui/components/badge'
import { Monitor, Smartphone, Trash2 } from 'lucide-react'
import { P } from '@/components/typography'
import { Button } from '@virtality/ui/components/button'
import { useRouter } from 'next/navigation'
import { useClientT } from '@/i18n/use-client-t'

interface SessionCardProps {
  session: Session
  isCurrentSession?: boolean
}

export const SessionCard = ({
  session,
  isCurrentSession,
}: SessionCardProps) => {
  const router = useRouter()
  const { t, i18n } = useClientT(['user', 'common'])
  const userAgentInfo = session.userAgent ? UAParser(session.userAgent) : null

  const getBrowserInfo = () => {
    if (!userAgentInfo) return t('sessions.unknownDevice')
    if (!userAgentInfo.browser.name && !userAgentInfo.os.name)
      return t('sessions.unknownDevice')

    if (!userAgentInfo.browser.name) return userAgentInfo.os.name
    if (!userAgentInfo.os.name) return userAgentInfo.browser.name

    return `${userAgentInfo.browser.name}, ${userAgentInfo.os.name}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date))
  }

  const revokeSessionHandler = () =>
    authClient.revokeSession({
      token: session.token,
      fetchOptions: { onSuccess: () => router.refresh() },
    })

  return (
    <Card>
      <CardHeader className='flex justify-between'>
        <CardTitle>{getBrowserInfo()}</CardTitle>
        {isCurrentSession && <Badge>{t('sessions.current')}</Badge>}
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {userAgentInfo?.device.type === 'mobile' ? (
              <Smartphone />
            ) : (
              <Monitor />
            )}
            <div>
              <P>
                {t('sessions.created', { date: formatDate(session.createdAt) })}
              </P>
              <P>
                {t('sessions.expires', { date: formatDate(session.expiresAt) })}
              </P>
            </div>
          </div>
          {!isCurrentSession && (
            <Button
              variant='destructive'
              size='icon'
              onClick={revokeSessionHandler}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
