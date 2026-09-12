'use client'

import { cn } from '@/lib/utils'

const OFFLINE_PREFIX = 'Offline'

export function HeadsetStatusLine({
  online,
  subtitle,
  className,
}: {
  online: boolean
  subtitle: string
  className?: string
}) {
  // Offline subtitles already lead with "Offline"; online ones ("2 GB free",
  // "Connecting…") get the word prepended so both states show a colored word.
  const detail = online
    ? ` · ${subtitle}`
    : subtitle.startsWith(OFFLINE_PREFIX)
      ? subtitle.slice(OFFLINE_PREFIX.length)
      : ` · ${subtitle}`

  return (
    <p className={cn('text-muted-foreground', className)}>
      <span className={online ? 'text-green-600' : 'text-red-600'}>
        {online ? 'Online' : 'Offline'}
      </span>
      {detail}
    </p>
  )
}
