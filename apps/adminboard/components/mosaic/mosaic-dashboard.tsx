'use client'

import MosaicBoardPreview from '@/components/mosaic/mosaic-board-preview'
import MosaicDesktopGate from '@/components/mosaic/mosaic-desktop-gate'
import { useMosaicPhoneGate } from '@/hooks/use-mosaic-phone-gate'
import { useMosaic } from '@virtality/react-query'

const MosaicDashboard = () => {
  const isPhone = useMosaicPhoneGate()
  const { data, isPending } = useMosaic()

  if (isPhone) {
    return <MosaicDesktopGate />
  }

  return <MosaicBoardPreview board={data} isLoading={isPending} />
}

export default MosaicDashboard
