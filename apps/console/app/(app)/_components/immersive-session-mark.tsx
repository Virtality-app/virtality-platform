'use client'

import { Clapperboard } from 'lucide-react'
import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'

/** Marks a home dashboard entry as an Immersive Session rather than a program. */
const ImmersiveSessionMark = ({ className }: { className?: string }) => {
  const { t } = useClientT('home')
  const label = t('sessions.immersiveVideo')
  return (
    <Clapperboard
      role='img'
      aria-label={label}
      className={cn('text-muted-foreground size-3.5 shrink-0', className)}
    >
      <title>{label}</title>
    </Clapperboard>
  )
}

export default ImmersiveSessionMark
