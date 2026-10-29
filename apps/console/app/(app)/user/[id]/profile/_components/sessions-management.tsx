'use client'
import { authClient } from '@/auth-client'
import { Card, CardContent } from '@virtality/ui/components/card'
import { H3 } from '@/components/typography'
import { Button } from '@virtality/ui/components/button'
import { useRouter } from 'next/navigation'
import { useClientT } from '@/i18n/use-client-t'
import { SessionCard } from './session-card'
import type { SessionsTabProps } from './sessions-tab'

export const SessionsManagement = ({
  sessions,
  currentSessionToken,
}: SessionsTabProps) => {
  const router = useRouter()
  const { t } = useClientT(['user', 'common'])
  const otherSessions = sessions.filter((s) => s.token !== currentSessionToken)
  const currentSession = sessions.find((s) => s.token == currentSessionToken)
  const revokeAllOtherSessionsHandler = () => {
    authClient.revokeOtherSessions(undefined, {
      onSuccess: () => router.refresh(),
    })
  }

  return (
    <div className='space-y-6'>
      {currentSession && (
        <SessionCard session={currentSession} isCurrentSession />
      )}

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <H3>{t('sessions.other')}</H3>
          {otherSessions.length > 0 && (
            <Button
              variant='destructive'
              onClick={revokeAllOtherSessionsHandler}
            >
              {t('sessions.revokeAll')}
            </Button>
          )}
        </div>

        {otherSessions.length === 0 ? (
          <Card>
            <CardContent>{t('sessions.none')}</CardContent>
          </Card>
        ) : (
          <div className='space-y-3'>
            {otherSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
