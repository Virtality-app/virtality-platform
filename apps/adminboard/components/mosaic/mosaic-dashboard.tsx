'use client'

import MosaicBoardPreview from '@/components/mosaic/mosaic-board-preview'
import MosaicDesktopGate from '@/components/mosaic/mosaic-desktop-gate'
import MosaicEditor from '@/components/mosaic/mosaic-editor'
import { useMosaicPhoneGate } from '@/hooks/use-mosaic-phone-gate'
import { useMosaic } from '@virtality/react-query'

const MosaicDashboard = () => {
  const isPhone = useMosaicPhoneGate()
  const { data: board, isPending } = useMosaic()

  if (isPhone) {
    return <MosaicDesktopGate />
  }

  return (
    <div className='space-y-10'>
      <MosaicBoardPreview board={board} isLoading={isPending} />
      <MosaicEditor />
    </div>
  )
}

export default MosaicDashboard
