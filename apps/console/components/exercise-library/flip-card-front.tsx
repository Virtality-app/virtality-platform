import { useClientT } from '@/i18n/use-client-t'
import { MouseEvent } from 'react'
import { Pause, Play } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { Card, CardFooter } from '@virtality/ui/components/card'
import { cn, getDisplayName } from '@/lib/utils'
import { P } from '@/components/typography'
import { Exercise } from '@virtality/db'
import type {
  DirectionBadgeHighlight,
  NearTermDirection,
} from '@virtality/shared/utils'
import type { FavoriteTargetRow } from './flip-card-favorites'
import FlipCardActions from './flip-card-actions'
import FlipCardDirectionBadges from './flip-card-direction-badges'
import FlipCardMedia from './flip-card-media'

interface FlipCardFrontProps {
  exercise: Exercise
  isSelected: boolean
  isPreviewPlaying: boolean
  isTouchDevice: boolean
  isFlipped: boolean
  favoriteExerciseId?: string | null
  familyFavoriteTargets?: FavoriteTargetRow[]
  footerTitle?: string
  directionBadges?: DirectionBadgeHighlight[]
  onDirectionBadgeClick?: (side: NearTermDirection, e: MouseEvent) => void
  handleFlip: (e: MouseEvent) => void
  handlePreviewToggle: (e: MouseEvent) => void
  videoRef: React.RefObject<HTMLVideoElement | null>
}

const FlipCardFront = ({
  exercise,
  isSelected,
  isPreviewPlaying,
  isTouchDevice,
  isFlipped,
  favoriteExerciseId,
  familyFavoriteTargets,
  footerTitle,
  directionBadges,
  onDirectionBadgeClick,
  videoRef,
  handleFlip,
  handlePreviewToggle,
}: FlipCardFrontProps) => {
  const { t } = useClientT('shared')
  const primaryLabel = footerTitle ?? getDisplayName(exercise)
  return (
    <Card
      className={cn(
        'absolute inset-0 flex flex-col gap-0 overflow-hidden rounded-lg p-0 transition-all backface-hidden',
        isSelected && 'ring-cyan-highlight',
      )}
    >
      <div className='relative flex w-full flex-1 items-center overflow-hidden'>
        <FlipCardMedia
          exercise={exercise}
          primaryLabel={primaryLabel}
          isPreviewPlaying={isPreviewPlaying}
          isTouchDevice={isTouchDevice}
          videoRef={videoRef}
        />
        {!isFlipped && (
          <>
            <FlipCardActions
              exercise={exercise}
              favoriteExerciseId={favoriteExerciseId}
              familyFavoriteTargets={familyFavoriteTargets}
              handleFlip={handleFlip}
            />
            <Button
              type='button'
              onClick={handlePreviewToggle}
              aria-label={
                isPreviewPlaying
                  ? t('exerciseLibrary.pausePreview')
                  : t('exerciseLibrary.playPreview')
              }
              size='icon'
              className='absolute top-2 left-2 z-10 rounded-full bg-black/65 p-2 text-white shadow-md transition hover:scale-105 hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none'
            >
              {isPreviewPlaying ? (
                <Pause className='size-4 fill-current' />
              ) : (
                <Play className='size-4 fill-current' />
              )}
            </Button>
          </>
        )}
      </div>
      <CardFooter className='flex min-h-20 flex-col items-center justify-center gap-1.5 p-2 text-center'>
        <P className='text-sm'>{primaryLabel}</P>
        {directionBadges?.length ? (
          <FlipCardDirectionBadges
            badges={directionBadges}
            onBadgeClick={onDirectionBadgeClick}
          />
        ) : null}
      </CardFooter>
    </Card>
  )
}

export default FlipCardFront
