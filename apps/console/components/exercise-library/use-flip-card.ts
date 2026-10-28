import { useEffect, useRef, useState, MouseEvent } from 'react'
import { Exercise } from '@virtality/db'

export function useFlipCard(exercise: Exercise) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const handleFlip = (e: MouseEvent) => {
    e.stopPropagation()
    setIsPreviewPlaying(false)
    setIsFlipped(!isFlipped)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const updateInteractionMode = () => setIsTouchDevice(mediaQuery.matches)

    updateInteractionMode()
    mediaQuery.addEventListener('change', updateInteractionMode)
    return () => mediaQuery.removeEventListener('change', updateInteractionMode)
  }, [])

  useEffect(() => {
    if (!isPreviewPlaying) {
      videoRef.current?.pause()
      return
    }
    void videoRef.current?.play().catch(() => {
      setIsPreviewPlaying(false)
    })
  }, [isPreviewPlaying])

  const handlePreviewToggle = (e: MouseEvent) => {
    e.stopPropagation()
    if (!exercise.video) return
    setIsPreviewPlaying((prev) => !prev)
  }

  return {
    isFlipped,
    isPreviewPlaying,
    isTouchDevice,
    videoRef,
    handleFlip,
    handlePreviewToggle,
  }
}
