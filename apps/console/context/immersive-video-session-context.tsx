'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useImmersiveVideoList } from '@virtality/react-query'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { useHeadsetLibrary } from '@/hooks/use-headset-library'
import { useImmersiveVideoPlayback } from '@/hooks/use-immersive-video-playback'
import { useVrPresencePolling } from '@/hooks/use-vr-presence-polling'
import { isVideoPlaybackActive } from '@/lib/video-playback-active'
import { isImmersivePlaybackBlocking } from '@/lib/immersive-video-playback-reducer'
import { buildHeadsetLibraryRows } from '@/lib/headset-library-rows'
import { toCatalogVideos } from '@/lib/vr-video-page-state'
import { isReplacementNoticeError } from '@/lib/socket-replacement-notice'
import useSocketConnection from '@/hooks/use-socket-connection'
import type { HeadsetLibraryRow } from '@/lib/headset-library-rows'

export type ImmersiveVideoSessionValue = {
  rows: HeadsetLibraryRow[]
  selectedVideoId: string | null
  setSelectedVideoId: (videoId: string | null) => void
  selectedRow: HeadsetLibraryRow | undefined
  playback: ReturnType<typeof useImmersiveVideoPlayback>
  roomComplete: boolean
  replaced: boolean
  replacementDialogOpen: boolean
  dismissReplacementDialog: () => void
  pollOnline: boolean
  videoActive: boolean
  frozen: boolean
}

const ImmersiveVideoSessionContext =
  createContext<ImmersiveVideoSessionValue | null>(null)

export function ImmersiveVideoSessionProvider({
  children,
}: {
  children: ReactNode
}) {
  const { state } = usePatientDashboard()
  const { selectedDevice, selectedMode } = state
  const { connectionError, connectionState } = useSocketConnection({
    device: selectedDevice,
  })
  const library = useHeadsetLibrary(selectedDevice, { autoConnect: false })
  const replaced =
    library.replaced ||
    (connectionState === 'failed' && isReplacementNoticeError(connectionError))
  const playback = useImmersiveVideoPlayback(selectedDevice, {
    frozen: replaced,
  })
  const catalogQuery = useImmersiveVideoList()
  const catalog = useMemo(
    () => toCatalogVideos(catalogQuery.data?.videos),
    [catalogQuery.data?.videos],
  )
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)
  const [replacementAcked, setReplacementAcked] = useState(false)
  const [, setNowTick] = useState(0)

  const presenceByDeviceId = useVrPresencePolling({
    enabled: Boolean(selectedDevice),
    devices: selectedDevice
      ? [
          {
            id: selectedDevice.data.id,
            deviceId: selectedDevice.data.deviceId,
          },
        ]
      : [],
  })

  const liveSnapshot = library.libraryState
    ? {
        videos: library.libraryState.videos,
        freeBytes: library.libraryState.freeBytes,
      }
    : { videos: [], freeBytes: 0 }

  const rows = buildHeadsetLibraryRows(
    catalog,
    liveSnapshot,
    library.roomComplete && !replaced,
  ).filter((row) => row.inCatalog)

  const selectedRow = rows.find((row) => row.videoId === selectedVideoId)

  useEffect(() => {
    if (playback.state.videoId) {
      setSelectedVideoId(playback.state.videoId)
    }
  }, [playback.state.videoId])

  useEffect(() => {
    if (selectedMode === 'immersive') {
      playback.enterImmersive()
    }
    // enterImmersive is stable enough per render; mode transitions are the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMode])

  useEffect(() => {
    if (!replaced) setReplacementAcked(false)
  }, [replaced])

  useEffect(() => {
    if (
      playback.state.status !== 'Idle' ||
      playback.state.lastProgressAt == null
    ) {
      return
    }
    const id = setInterval(() => setNowTick((tick) => tick + 1), 500)
    return () => clearInterval(id)
  }, [playback.state.status, playback.state.lastProgressAt])

  const videoActive = isVideoPlaybackActive({
    status: playback.state.status,
    lastProgressAt: playback.state.lastProgressAt,
    now: Date.now(),
  })

  const replacementDialogOpen = replaced && !replacementAcked

  const value: ImmersiveVideoSessionValue = {
    rows,
    selectedVideoId,
    setSelectedVideoId,
    selectedRow,
    playback,
    roomComplete: library.roomComplete,
    replaced,
    replacementDialogOpen,
    dismissReplacementDialog: () => {
      setReplacementAcked(true)
      library.dismissReplacementDialog()
    },
    pollOnline: presenceByDeviceId[selectedDevice?.data.id ?? ''] === 'online',
    videoActive:
      videoActive || isImmersivePlaybackBlocking(playback.state.status),
    frozen: replaced,
  }

  return (
    <ImmersiveVideoSessionContext.Provider value={value}>
      {children}
    </ImmersiveVideoSessionContext.Provider>
  )
}

export function useImmersiveVideoSession(): ImmersiveVideoSessionValue {
  const ctx = useContext(ImmersiveVideoSessionContext)
  if (!ctx) {
    throw new Error(
      'useImmersiveVideoSession must be used within ImmersiveVideoSessionProvider',
    )
  }
  return ctx
}
