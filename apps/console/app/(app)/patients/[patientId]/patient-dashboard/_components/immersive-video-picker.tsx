'use client'

import { useClientT } from '@/i18n/use-client-t'
import { useState } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@virtality/ui/components/popover'
import { cn } from '@/lib/utils'
import { useImmersiveVideoSession } from '@/context/immersive-video-session-context'
import { isImmersivePlaybackBlocking } from '@/lib/immersive-video-playback-reducer'
import { isImmersivePickerRowSelectable } from '@/lib/immersive-video-picker'
import { ImmersiveVideoPickerRow } from './immersive-video-picker-row'

export function ImmersiveVideoPicker({ className }: { className?: string }) {
  const { rows, selectedRow, setSelectedVideoId, playback, frozen } =
    useImmersiveVideoSession()
  const { t } = useClientT('patient-dashboard')
  const [open, setOpen] = useState(false)
  const pickerDisabled =
    frozen || isImmersivePlaybackBlocking(playback.state.status)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          disabled={pickerDisabled}
          className={cn(
            'hover:bg-card justify-start dark:border-zinc-600',
            className,
          )}
        >
          <span className='min-w-5 flex-1 overflow-hidden text-left text-ellipsis'>
            {selectedRow?.title ?? t('immersive.selectVideo')}
          </span>
          <ChevronsUpDown className='opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-(--radix-popover-trigger-width) p-1'>
        {rows.length === 0 ? (
          <p className='text-muted-foreground p-3 text-sm'>
            {t('immersive.noVideos')}
          </p>
        ) : (
          rows.map((row) => (
            <ImmersiveVideoPickerRow
              key={row.videoId}
              row={row}
              selected={selectedRow?.videoId === row.videoId}
              disabled={pickerDisabled}
              onSelect={(videoId) => {
                if (!isImmersivePickerRowSelectable(row.cell)) return
                setSelectedVideoId(videoId)
                setOpen(false)
              }}
            />
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
