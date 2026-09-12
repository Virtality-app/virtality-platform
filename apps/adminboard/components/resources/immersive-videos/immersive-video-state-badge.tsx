'use client'

import { immersiveVideoStateBadgeLabel } from '@/lib/immersive-video-admin-row'
import type { ImmersiveVideoAdminRow } from '@/lib/immersive-video-admin-row'
import { Badge } from '@virtality/ui/components/badge'
import { cn } from '@/lib/utils'

export function ImmersiveVideoStateBadge({
  row,
}: {
  row: ImmersiveVideoAdminRow
}) {
  const label = immersiveVideoStateBadgeLabel(row)
  return (
    <Badge
      data-testid='immersive-video-state-badge'
      className={cn('rounded-full px-2 py-1 font-normal')}
    >
      {label}
    </Badge>
  )
}
