'use client'

import { ImmersiveVideoProgress } from './immersive-video-progress'
import { ImmersiveVideoSelectedCard } from './immersive-video-selected-card'

export function ImmersiveVideoPanel({
  cardClassName,
  progressClassName,
}: {
  cardClassName?: string
  progressClassName?: string
}) {
  return (
    <>
      <ImmersiveVideoSelectedCard className={cardClassName} />
      {progressClassName ? (
        <ImmersiveVideoProgress className={progressClassName} />
      ) : null}
    </>
  )
}
