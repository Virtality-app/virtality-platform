'use client'

import { cn } from '@/lib/utils'
import { ImmersiveVideoProgress } from './immersive-video-progress'
import { ImmersiveVideoSelectedCard } from './immersive-video-selected-card'

export function ImmersiveVideoPanel({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <ImmersiveVideoSelectedCard />
      <ImmersiveVideoProgress />
    </div>
  )
}
