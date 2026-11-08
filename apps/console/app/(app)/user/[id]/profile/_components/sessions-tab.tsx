'use client'
import type { Session } from '@/auth-client'
import { Card, CardContent } from '@virtality/ui/components/card'
import { SessionsManagement } from './sessions-management'

export interface SessionsTabProps {
  sessions: Session[]
  currentSessionToken: string
}

const SessionsTab = ({ sessions, currentSessionToken }: SessionsTabProps) => {
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
