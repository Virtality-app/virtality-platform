'use client'

import { Button } from '@/components/ui/button'
import { MosaicAddMediaDialog } from '@/components/mosaic/mosaic-add-media-dialog'
import MosaicBoardEditor from '@/components/mosaic/mosaic-board-editor'
import MosaicTray from '@/components/mosaic/mosaic-tray'
import {
  addMosaicTrayItem,
  createEmptyMosaicEditorState,
  placeMosaicTileFromTray,
  type MosaicEditorState,
  type MosaicTrayItem,
} from '@/lib/mosaic-editor'
import { PlusSquare } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const MosaicEditor = () => {
  const [editorState, setEditorState] = useState<MosaicEditorState>(
    createEmptyMosaicEditorState,
  )
  const [addMediaOpen, setAddMediaOpen] = useState(false)

  const handleAddToTray = (item: MosaicTrayItem) => {
    setEditorState((current) => addMosaicTrayItem(current, item))
    toast.success('Media added to the staging tray.')
  }

  const handlePlaceTile = (trayItemId: string, row: number, col: number) => {
    let isOccupied = false

    setEditorState((current) => {
      const result = placeMosaicTileFromTray(
        current,
        trayItemId,
        row,
        col,
        crypto.randomUUID(),
      )

      if (!result.ok) {
        isOccupied = result.reason === 'occupied'
        return current
      }

      return result.state
    })

    if (isOccupied) {
      toast.error('That cell is already occupied.')
    }
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <p className='text-muted-foreground max-w-2xl text-sm'>
            Stage bucket media in the tray, then drag items onto the board as
            1×1 tiles. Save and resize controls arrive in a later slice.
          </p>
        </div>
        <Button
          variant='primary'
          className='ml-auto flex items-center'
          onClick={() => setAddMediaOpen(true)}
        >
          <PlusSquare />
          Add media
        </Button>
      </div>

      <MosaicTray items={editorState.tray} />

      <MosaicBoardEditor
        tiles={editorState.tiles}
        onPlaceTile={handlePlaceTile}
      />

      <MosaicAddMediaDialog
        open={addMediaOpen}
        onOpenChange={setAddMediaOpen}
        onAddToTray={handleAddToTray}
      />
    </div>
  )
}

export default MosaicEditor
