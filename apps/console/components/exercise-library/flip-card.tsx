'use client'

import { MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import { Exercise } from '@virtality/db'
import type {
  DirectionBadgeHighlight,
  NearTermDirection,
} from '@virtality/shared/utils'
import type { FavoriteTargetRow } from './flip-card-favorites'
import FlipCardFront from './flip-card-front'
import FlipCardBack from './flip-card-back'
import { useFlipCard } from './use-flip-card'

interface FlipCardProps {
  exercise: Exercise
  className?: string
  isSelected: boolean
  /** Favorite row id for `exercise.id` when not using `familyFavoriteTargets`. */
  favoriteExerciseId?: string | null
  /** When set, favorite add/remove applies to every variant (e.g. bilateral family). */
  familyFavoriteTargets?: FavoriteTargetRow[]
  onSelect: (e: MouseEvent) => void
  /** When set, footer shows this title (e.g. family `displayName`) instead of `displayName + direction`. */
  footerTitle?: string
  /** Left/Right availability for family cards; `emphasized` reflects direction-aware search. */
  directionBadges?: DirectionBadgeHighlight[]
  /** Toggle a single near-term variant without dual-side auto-add (GitHub #13). */
  onDirectionBadgeClick?: (side: NearTermDirection, e: MouseEvent) => void
  /** `data-tour` hook for the Getting started walkthrough. */
  tourTarget?: string
}

const FlipCard = ({
  exercise,
  className,
  isSelected,
  favoriteExerciseId,
  familyFavoriteTargets,
  onSelect,
  footerTitle,
  directionBadges,
  onDirectionBadgeClick,
  tourTarget,
}: FlipCardProps) => {
  const {
    isFlipped,
    isPreviewPlaying,
    isTouchDevice,
    videoRef,
    handleFlip,
    handlePreviewToggle,
  } = useFlipCard(exercise)

  return (
    <div
      id={exercise.id}
      data-tour={tourTarget}
      onClick={onSelect}
      className={cn(
        'perspective-1000 relative w-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        isSelected &&
          'scale-[1.01] drop-shadow-[0_0_16px_rgba(34,211,238,0.55)] transition-transform duration-200',
        className,
      )}
    >
      <div
        className={cn(
          'preserve-3d relative aspect-4/5 size-full transition-transform duration-500 ease-in-out',
          isFlipped && 'rotate-y-180',
        )}
      >
        <FlipCardFront
          exercise={exercise}
          isSelected={isSelected}
          isPreviewPlaying={isPreviewPlaying}
          isTouchDevice={isTouchDevice}
          videoRef={videoRef}
          isFlipped={isFlipped}
          favoriteExerciseId={favoriteExerciseId}
          familyFavoriteTargets={familyFavoriteTargets}
          footerTitle={footerTitle}
          directionBadges={directionBadges}
          onDirectionBadgeClick={onDirectionBadgeClick}
          handleFlip={handleFlip}
          handlePreviewToggle={handlePreviewToggle}
        />

        <FlipCardBack
          exercise={exercise}
          isSelected={isSelected}
          footerTitle={footerTitle}
          handleFlip={handleFlip}
        />
      </div>
    </div>
  )
}

export default FlipCard
