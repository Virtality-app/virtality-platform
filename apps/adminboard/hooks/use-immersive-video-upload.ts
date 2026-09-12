'use client'

import { getErrorMessage } from '@/lib/get-error-message'
import type { ImmersiveVideoAdminRow } from '@/lib/immersive-video-admin-row'
import { formatImmersiveVideoSize } from '@/lib/immersive-video-admin-row'
import {
  isAllowedImmersiveVideoFilename,
  IMMERSIVE_VIDEO_UNSUPPORTED_FILE,
} from '@/lib/immersive-video-admin-row'
import {
  immersiveVideoPartSlice,
  planImmersiveVideoParts,
  resumeImmersiveVideoPartNumbers,
} from '@/lib/immersive-video-upload-plan'
import { useORPC } from '@virtality/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const UNLOAD_MESSAGE =
  "An upload is in progress. Leaving will pause it; you can resume from the video's row."

type UploadHookArgs = {
  onCatalogChange: () => void
}

export function useImmersiveVideoUpload({ onCatalogChange }: UploadHookArgs) {
  const orpc = useORPC()
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [uploadedBytes, setUploadedBytes] = useState(0)
  const [totalBytes, setTotalBytes] = useState(0)
  const [partInFlight, setPartInFlight] = useState(false)
  const abortRef = useRef(false)

  useEffect(() => {
    if (!partInFlight) {
      return
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = UNLOAD_MESSAGE
      return UNLOAD_MESSAGE
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [partInFlight])

  const reset = useCallback(() => {
    abortRef.current = false
    setActiveVideoId(null)
    setUploadedBytes(0)
    setTotalBytes(0)
    setPartInFlight(false)
  }, [])

  const uploadParts = useCallback(
    async (id: string, file: File, partNumbers: number[]) => {
      abortRef.current = false
      setActiveVideoId(id)
      setTotalBytes(file.size)
      for (const partNumber of partNumbers) {
        if (abortRef.current) {
          break
        }
        const slice = immersiveVideoPartSlice(file.size, partNumber)
        const blob = file.slice(slice.start, slice.end)
        const part = new File([blob], `${file.name}.part${partNumber}`, {
          type: file.type,
        })
        setPartInFlight(true)
        try {
          await orpc.immersiveVideo.upload.part.call({
            id,
            partNumber,
            part,
          })
          setUploadedBytes(slice.end)
        } finally {
          setPartInFlight(false)
        }
        onCatalogChange()
      }
      if (abortRef.current) {
        return
      }
      await orpc.immersiveVideo.upload.complete.call({ id })
      reset()
      onCatalogChange()
    },
    [onCatalogChange, orpc, reset],
  )

  const startUpload = useCallback(
    async (
      videoId: string,
      file: File,
      durationSec: number | null,
      mode: 'start' | 'resume' = 'start',
    ) => {
      if (activeVideoId && activeVideoId !== videoId) {
        toast.error('Finish or cancel the current upload first.')
        return
      }
      if (
        !isAllowedImmersiveVideoFilename(file.name) ||
        !file.type.startsWith('video/')
      ) {
        toast.error(IMMERSIVE_VIDEO_UNSUPPORTED_FILE)
        return
      }

      try {
        if (mode === 'resume') {
          const status = await orpc.immersiveVideo.upload.status.call({
            id: videoId,
          })
          if (file.size !== status.sizeBytes) {
            toast.error(
              `Pick the same file you started with (${status.filename}, ${formatImmersiveVideoSize(status.sizeBytes)}), or cancel this upload.`,
            )
            return
          }
          if (file.name !== status.filename) {
            toast.warning(
              `Pick the same file you started with (${status.filename}, ${formatImmersiveVideoSize(status.sizeBytes)}), or cancel this upload.`,
            )
          }
          const missing = resumeImmersiveVideoPartNumbers(
            status.uploadedPartNumbers,
            planImmersiveVideoParts(file.size).partCount,
          )
          const uploadedSoFar =
            file.size -
            missing.reduce((sum, partNumber) => {
              return sum + immersiveVideoPartSlice(file.size, partNumber).size
            }, 0)
          setUploadedBytes(uploadedSoFar)
          await uploadParts(videoId, file, missing)
          return
        }

        await orpc.immersiveVideo.upload.start.call({
          id: videoId,
          filename: file.name,
          sizeBytes: file.size,
          contentType: file.type || 'video/mp4',
          durationSec,
        })
        onCatalogChange()
        const { parts } = planImmersiveVideoParts(file.size)
        await uploadParts(
          videoId,
          file,
          parts.map((part) => part.partNumber),
        )
      } catch (error) {
        toast.error(getErrorMessage(error, 'Upload failed.'))
        setPartInFlight(false)
      }
    },
    [activeVideoId, onCatalogChange, orpc, uploadParts],
  )

  const abortUpload = useCallback(
    async (videoId: string) => {
      abortRef.current = true
      await orpc.immersiveVideo.upload.abort.call({ id: videoId })
      reset()
      onCatalogChange()
    },
    [onCatalogChange, orpc, reset],
  )

  return {
    activeVideoId,
    isUploading: activeVideoId != null,
    uploadedBytes,
    totalBytes,
    partInFlight,
    startUpload,
    abortUpload,
    otherRowsDisabledMessage: 'Finish or cancel the current upload first.',
  }
}

export type ImmersiveVideoUploadController = ReturnType<
  typeof useImmersiveVideoUpload
>

export function readVideoDurationSec(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    const objectUrl = URL.createObjectURL(file)
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration)
        ? Math.round(video.duration)
        : null
      URL.revokeObjectURL(objectUrl)
      resolve(duration)
    }
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }
    video.src = objectUrl
  })
}

export type { ImmersiveVideoAdminRow }
