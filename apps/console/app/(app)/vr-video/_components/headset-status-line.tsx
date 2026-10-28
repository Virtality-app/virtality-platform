'use client'

import { cn } from '@/lib/utils'
import { useClientT } from '@/i18n/use-client-t'

export function HeadsetStatusLine({
  online,
  subtitle,
  className,
}: {
  online: boolean
  subtitle: string
  className?: string
}) {
  const { t } = useClientT('vr-video')

  return (
    <p className={cn('text-muted-foreground', className)}>
      <span className={online ? 'text-green-600' : 'text-red-600'}>
        {online ? t('status.online') : t('status.offline')}
      </span>
      {` · ${subtitle}`}
    </p>
  )
}
