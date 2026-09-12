'use client'

import { Crosshair, PauseCircle, PlayCircle, StopCircle } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import { useImmersiveVideoSession } from '@/context/immersive-video-session-context'
import { isImmersivePickerRowSelectable } from '@/lib/immersive-video-picker'

export function ImmersiveVideoTransport() {
  const { selectedRow, playback, roomComplete, frozen } =
    useImmersiveVideoSession()
  const { state, sendPlay, sendPause, sendResume, sendStop, sendRecenter } =
    playback
  const readySelected =
    selectedRow != null && isImmersivePickerRowSelectable(selectedRow.cell)
  const commandsEnabled = roomComplete && !frozen
  const playEnabled =
    commandsEnabled && readySelected && state.status === 'Idle'
  const pauseEnabled = commandsEnabled && state.status === 'Playing'
  const resumeEnabled = commandsEnabled && state.status === 'Paused'
  const stopEnabled =
    commandsEnabled && (state.status === 'Playing' || state.status === 'Paused')
  const recenterEnabled =
    commandsEnabled && (state.status === 'Playing' || state.status === 'Paused')

  return (
    <>
      <Button
        variant='primary'
        size='icon'
        aria-label='Play'
        disabled={!playEnabled}
        onClick={() => {
          if (selectedRow) sendPlay(selectedRow.videoId)
        }}
      >
        <PlayCircle className='size-6' />
      </Button>
      <Button
        variant='outline'
        size='icon'
        aria-label='Pause'
        disabled={!pauseEnabled}
        onClick={sendPause}
      >
        <PauseCircle className='size-6' />
      </Button>
      <Button
        variant='outline'
        size='icon'
        aria-label='Resume'
        disabled={!resumeEnabled}
        onClick={sendResume}
      >
        <PlayCircle className='size-6' />
      </Button>
      <Button
        variant='destructive'
        size='icon'
        aria-label='Stop'
        disabled={!stopEnabled}
        onClick={sendStop}
      >
        <StopCircle className='size-6' />
      </Button>
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
