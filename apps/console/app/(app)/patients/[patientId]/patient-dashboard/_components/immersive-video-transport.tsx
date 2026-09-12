'use client'

import { Crosshair, PauseCircle, PlayCircle, StopCircle } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { useImmersiveVideoSession } from '@/context/immersive-video-session-context'
import { isImmersivePickerRowSelectable } from '@/lib/immersive-video-picker'
import {
  isImmersiveRecenterEnabled,
  isImmersiveStopEnabled,
  resolveImmersivePlayPauseControl,
  shouldShowImmersiveStop,
} from '@/lib/immersive-video-transport'

export function ImmersiveVideoTransport() {
  const { selectedRow, playback, roomComplete, frozen } =
    useImmersiveVideoSession()
  const { state, sendPlay, sendPause, sendResume, sendStop, sendRecenter } =
    playback
  const readySelected =
    selectedRow != null && isImmersivePickerRowSelectable(selectedRow.cell)
  const commandsEnabled = roomComplete && !frozen
  const playPause = resolveImmersivePlayPauseControl({
    status: state.status,
    commandsEnabled,
    readySelected,
  })
  const showStop = shouldShowImmersiveStop(state.status)
  const stopEnabled = isImmersiveStopEnabled({
    status: state.status,
    commandsEnabled,
  })
  const recenterEnabled = isImmersiveRecenterEnabled({
    status: state.status,
    commandsEnabled,
  })

  const handlePlayPause = () => {
    if (playPause.action === 'play') {
      if (selectedRow) sendPlay(selectedRow.videoId)
      return
    }
    if (playPause.action === 'pause') {
      sendPause()
      return
    }
    sendResume()
  }

  return (
    <>
      <Button
        variant='primary'
        size='icon'
        aria-label={playPause.icon === 'play' ? 'Play' : 'Pause'}
        disabled={playPause.disabled}
        onClick={handlePlayPause}
      >
        {playPause.icon === 'play' ? (
          <PlayCircle className='size-6' />
        ) : (
          <PauseCircle className='size-6' />
        )}
      </Button>
      {showStop ? (
        <Button
          size='icon'
          variant='destructive'
          aria-label='Stop'
          disabled={!stopEnabled}
          onClick={sendStop}
        >
          <StopCircle className='size-6' />
        </Button>
      ) : null}
      <Button
        variant='outline'
        size='icon'
        aria-label='Recenter'
        disabled={!recenterEnabled}
        onClick={sendRecenter}
      >
        <Crosshair className='size-6' />
      </Button>
    </>
  )
}
