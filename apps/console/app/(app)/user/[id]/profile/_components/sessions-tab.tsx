'use client'
import type { Session } from '@/auth-client'
import { Card, CardContent } from '@virtality/ui/components/card'
import usePageViewTracking from '@/hooks/analytics/use-page-view-tracking'
import { SessionsManagement } from './sessions-management'

export interface SessionsTabProps {
  sessions: Session[]
  currentSessionToken: string
}

const SessionsTab = ({ sessions, currentSessionToken }: SessionsTabProps) => {
  usePageViewTracking({
    props: { route_group: 'user', tab_view: 'user-sessions' },
  })
  return (
    <Card>
      <CardContent>
        <SessionsManagement
          sessions={sessions}
          currentSessionToken={currentSessionToken}
        />
      </CardContent>
    </Card>
  )
}

export default SessionsTab
