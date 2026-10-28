'use client'

import { Badge } from '@virtality/ui/components/badge'
import { useClientT } from '@/i18n/use-client-t'
import { getClinicalHistorySessionStatusLabel } from '@/lib/session-history'

interface SessionStatusBadgeProps {
  status: string
  className?: string
  /** Shown for any other status; defaults to nothing. */
  fallback?: string
}

/** Completed / Interrupted badge. */
const SessionStatusBadge = ({
  status,
  className,
  fallback,
}: SessionStatusBadgeProps) => {
  const { t } = useClientT('patients')
  const label = getClinicalHistorySessionStatusLabel(status)
  if (!label) return fallback ?? null

  return (
    <Badge
      variant={label === 'Interrupted' ? 'secondary' : 'outline'}
      className={className}
    >
      {t(`session.status.${label.toLowerCase()}`)}
    </Badge>
  )
}

export default SessionStatusBadge
