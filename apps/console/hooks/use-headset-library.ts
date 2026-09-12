'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ROOM_EVENT,
  VIDEO_EVENT,
  type VideoIdPayload,
  type VideoLibraryStatePayload,
} from '@virtality/shared/types'
import useSocketConnection from '@/hooks/use-socket-connection'
import { subscribe } from '@/lib/device-event-controller'
import { CONSOLE_REPLACEMENT_NOTICE_MESSAGE } from '@/lib/socket-replacement-notice'
import {
  applyDownloadComplete,
  applyDownloadFailed,
  applyDownloadPaused,
  applyDownloadProgress,
  type LiveLibraryState,
} from '@/lib/headset-library-live'
import type { VRDevice } from '@/types/models'

export const DOWNLOAD_ACK_TIMEOUT_MS = 5_000

export type HeadsetDidNotConfirmReason = 'didnt-respond' | 'disconnected'

export function useHeadsetLibrary(device?: VRDevice | null) {
  const { connect, disconnect, connectionState, connectionError } =
    useSocketConnection({ device })
  const [roomComplete, setRoomComplete] = useState(false)
  const [libraryState, setLibraryState] = useState<LiveLibraryState | null>(
    null,
  )
  const [replaced, setReplaced] = useState(false)
  const [replacementDialogOpen, setReplacementDialogOpen] = useState(false)
  const [confirmReason, setConfirmReason] =
    useState<HeadsetDidNotConfirmReason | null>(null)
  const pendingDownloadRef = useRef<{
    videoId: string
    kind: 'download'
  } | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deviceRef = useRef(device)
  deviceRef.current = device

  const clearPendingDownload = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    pendingDownloadRef.current = null
  }, [])

  useEffect(() => {
    if (
      connectionState === 'failed' &&
      connectionError === CONSOLE_REPLACEMENT_NOTICE_MESSAGE
    ) {
      setReplaced(true)
      setReplacementDialogOpen(true)
      setRoomComplete(false)
      clearPendingDownload()
    }
  }, [clearPendingDownload, connectionError, connectionState])

  useEffect(() => {
    if (replaced) return
    setRoomComplete(false)
    setLibraryState(null)
    clearPendingDownload()
  }, [clearPendingDownload, device?.data.id, replaced])

  useEffect(() => {
    if (!device?.data.deviceId || replaced) return

    device.mutations.setDeviceRoomCode(device.data.deviceId)
    void connect()

    return () => {
      disconnect()
    }
    // Connect/disconnect are not stable; join follows the selected headset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, replaced])

  useEffect(() => {
    const socket = device?.socket
    if (!socket) return

    const markIncomplete = () => {
      if (pendingDownloadRef.current) {
        clearPendingDownload()
        setConfirmReason('disconnected')
      }
      setRoomComplete(false)
    }

    const unsubscribeRoom = subscribe(socket, ROOM_EVENT, {
      RoomComplete: () => {
        setRoomComplete(true)
        deviceRef.current?.events.video.LibraryStateRequest()
      },
      MemberLeft: markIncomplete,
    })

    const unsubscribeVideo = subscribe(socket, VIDEO_EVENT, {
      LibraryState: (payload: VideoLibraryStatePayload) => {
        setLibraryState(payload)
      },
      DownloadAck: (payload: VideoIdPayload) => {
        if (pendingDownloadRef.current?.videoId === payload.videoId) {
          clearPendingDownload()
        }
      },
      DownloadProgress: (payload) => {
        setLibraryState((current) => applyDownloadProgress(current, payload))
      },
      DownloadComplete: (payload) => {
        setLibraryState((current) => applyDownloadComplete(current, payload))
      },
      DownloadFailed: (payload) => {
        setLibraryState((current) => applyDownloadFailed(current, payload))
      },
      DownloadPaused: (payload) => {
        setLibraryState((current) => applyDownloadPaused(current, payload))
      },
    })

    socket.on('disconnect', markIncomplete)

    return () => {
      unsubscribeRoom()
      unsubscribeVideo()
      socket.off('disconnect', markIncomplete)
    }
  }, [clearPendingDownload, device])

  const sendDownloadStart = useCallback(
    (videoId: string) => {
      if (!device || !roomComplete || replaced || pendingDownloadRef.current) {
        return
      }

      pendingDownloadRef.current = { videoId, kind: 'download' }
      device.events.video.DownloadStart({ videoId })
      timeoutRef.current = setTimeout(() => {
        if (pendingDownloadRef.current?.videoId === videoId) {
          clearPendingDownload()
          setConfirmReason('didnt-respond')
        }
      }, DOWNLOAD_ACK_TIMEOUT_MS)
    },
    [clearPendingDownload, device, replaced, roomComplete],
  )

  const sendDownloadPause = useCallback(
    (videoId: string) => {
      if (!device || !roomComplete || replaced) return
      device.events.video.DownloadPause({ videoId })
    },
    [device, replaced, roomComplete],
  )

  const sendDownloadCancel = useCallback(
    (videoId: string) => {
      if (!device || !roomComplete || replaced) return
      device.events.video.DownloadCancel({ videoId })
    },
    [device, replaced, roomComplete],
  )

  const sendDelete = useCallback(
    (videoId: string) => {
      if (!device || !roomComplete || replaced) return
      device.events.video.Delete({ videoId })
    },
    [device, replaced, roomComplete],
  )

  return {
    roomComplete,
    libraryState,
    replaced,
    replacementDialogOpen,
    confirmReason,
    dismissConfirm: () => setConfirmReason(null),
    dismissReplacementDialog: () => setReplacementDialogOpen(false),
    sendDownloadStart,
    sendDownloadPause,
    sendDownloadCancel,
    sendDelete,
  }
}
