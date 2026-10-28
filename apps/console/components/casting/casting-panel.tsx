'use client'

import type { RefObject } from 'react'
import { Button } from '@virtality/ui/components/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import type { CastingStatus } from '@/hooks/use-casting-handshake'
import { useCastingLoadTimeout } from '@/hooks/use-casting-load-timeout'
import {
  getCastingControlAction,
  getCastingControlLabelForAction,
  getCastingPlayerView,
  getCastingStatusLabel,
  isCastingControlDisabled,
  shouldShowVideoControls,
  shouldShowVideoElement,
} from '@/lib/patient-dashboard-casting-panel'
import { cn } from '@/lib/utils'
import { useClientT } from '@/i18n/use-client-t'
import { CastingPlayerOverlay } from './casting-player-overlay'
import { CastingTimeoutPrompt } from './casting-timeout-prompt'

type CastingPanelProps = {
  className?: string
  connected: boolean
  status: CastingStatus
  videoRef: RefObject<HTMLVideoElement | null>
  onStartCasting: () => void
  onStopCasting: () => void
}

export function CastingPanel({
  className,
  connected,
  status,
  videoRef,
  onStartCasting,
  onStopCasting,
}: CastingPanelProps) {
  const { t } = useClientT('patient-dashboard')
  const playerView = getCastingPlayerView(status)
  const controlAction = getCastingControlAction(status)
  const controlDisabled = isCastingControlDisabled(status, connected)
  const mountVideo = shouldShowVideoElement(playerView)
  const showVideoControls = shouldShowVideoControls()
  const isStreamVisible = playerView === 'connected'
  const { showTimeoutPrompt, handleWait } = useCastingLoadTimeout(playerView)

  const handleControlClick = () => {
    if (controlAction === 'start') {
      onStartCasting()
      return
    }

    onStopCasting()
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('casting.title')}</CardTitle>
      </CardHeader>
      <CardContent className='flex h-full flex-col gap-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <Button
            variant={controlAction === 'stop' ? 'outline' : 'default'}
            onClick={handleControlClick}
            disabled={controlDisabled}
          >
            {getCastingControlLabelForAction(controlAction)}
          </Button>
          <span
            aria-live='polite'
            className='text-muted-foreground text-sm select-none'
          >
            {getCastingStatusLabel(status)}
          </span>
        </div>

        <div className='flex flex-1 justify-center'>
          <div className='relative aspect-video w-full max-w-4xl'>
            <CastingPlayerOverlay view={playerView} />
            {mountVideo && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls={showVideoControls}
                className={cn(
                  'size-full rounded-lg border bg-black object-contain',
                  isStreamVisible
                    ? 'relative z-10'
                    : 'pointer-events-none absolute inset-0 opacity-0',
                )}
              />
            )}
          </div>
        </div>
      </CardContent>

      <CastingTimeoutPrompt
        open={showTimeoutPrompt}
        onWait={handleWait}
        onCancel={onStopCasting}
      />
    </Card>
  )
}
