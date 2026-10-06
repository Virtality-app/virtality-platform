'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { returnHrefWithChoice } from '@/lib/home-picker-return'

/**
 * When the home dashboard sent the clinician here to pair a headset, go back
 * to it with this headset picked as soon as a pairing finishes. Devices that
 * were already paired on arrival do not count.
 */
export function useReturnHomeOnPair(
  deviceRecordId: string,
  status: 'paired' | 'pairing' | 'unpaired',
) {
  const router = useRouter()
  const wasPairing = useRef(false)

  useEffect(() => {
    if (status === 'pairing') {
      wasPairing.current = true
      return
    }
    if (status !== 'paired' || !wasPairing.current) return
    wasPairing.current = false

    const href = returnHrefWithChoice(
      window.location.search,
      'deviceId',
      deviceRecordId,
    )
    if (href) router.push(href)
  }, [status, deviceRecordId, router])
}
