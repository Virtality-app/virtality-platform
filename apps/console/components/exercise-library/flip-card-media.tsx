import Image from 'next/image'
import { shouldBypassVercelImageOptimization } from '@virtality/shared/utils'
import { Exercise } from '@virtality/db'

interface FlipCardMediaProps {
  exercise: Exercise
  primaryLabel: string | undefined
  isPreviewPlaying: boolean
  isTouchDevice: boolean
  videoRef: React.RefObject<HTMLVideoElement | null>
}

const FlipCardMedia = ({
  exercise,
  primaryLabel,
  isPreviewPlaying,
  isTouchDevice,
  videoRef,
}: FlipCardMediaProps) => {
  const selectHint = isTouchDevice
    ? 'Tap card to select'
    : 'Click card to select'

  if (!isPreviewPlaying) {
    return (
      <>
        <Image
          src={exercise.image ?? '/placeholder.svg'}
          alt={primaryLabel + ' image'}
          fill
          unoptimized={shouldBypassVercelImageOptimization(exercise.image)}
          className='object-contain'
          sizes='(max-width: 640px) 90vw, (max-width: 1024px) 220px, 260px'
        />
        <div className='pointer-events-none absolute inset-0 flex items-end bg-linear-to-t from-black/80 via-black/30 to-transparent p-3 text-left text-white'>
          <div>
            <span className='block text-sm font-semibold sm:text-base'>
              {selectHint}
            </span>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className='absolute inset-0 bg-black'>
      <video
        ref={videoRef}
        muted
        loop
        autoPlay
        playsInline
        src={exercise.video ?? ''}
        poster={exercise.image || '/placeholder.svg'}
        className='pointer-events-none size-full object-contain'
      />
      <span className='pointer-events-none absolute right-2 bottom-2 rounded-md bg-black/65 px-2 py-1 text-xs text-white'>
        {selectHint}
      </span>
    </div>
  )
}

export default FlipCardMedia
