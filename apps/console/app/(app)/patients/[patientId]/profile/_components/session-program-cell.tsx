'use client'

import { Badge } from '@virtality/ui/components/badge'
import { useClientT } from '@/i18n/use-client-t'
import type { SessionListRowModel } from '@/lib/session-list-row'
import SessionActivityIcon from './session-activity-icon'

/** The program name, or the video and an "Immersive video" badge. */
const SessionProgramCell = ({ row }: { row: SessionListRowModel }) => {
  const { t } = useClientT('patients')
  if (!row.activity) {
    return <span className='text-sm'>{row.programName}</span>
  }

  return (
    <div className='flex min-w-0 items-center gap-2'>
      <SessionActivityIcon activity={row.activity} />
      <span className='truncate text-sm'>{row.programName}</span>
      <Badge variant='secondary' className='shrink-0 font-normal'>
        {t('session.immersive.badge')}
      </Badge>
    </div>
  )
}

export default SessionProgramCell
