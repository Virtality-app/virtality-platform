'use client'

import { useEffect, useRef, useState } from 'react'
import type { MosaicTileListItem } from '@virtality/shared/types'
import { shouldPlayMosaicAmbientVideo } from '@/lib/mosaic-ambient-video'
import {
  MOSAIC_TILE_FRAME_CLASS,
  getMosaicTileGridStyle,
} from '@/lib/mosaic-grid'
import {
  getMosaicVideoTileProps,
  type MosaicTileVideo,
} from '@/lib/mosaic-tile'

type MosaicVideoTileProps = {
  tile: MosaicTileListItem
}

type MosaicVideoTilePlayerProps = {
  tile: MosaicTileListItem
  tileVideo: MosaicTileVideo
}

const MosaicVideoTilePlayer = ({
  tile,
  tileVideo,
}: MosaicVideoTilePlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const { src, alt, mimeType } = tileVideo

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncReducedMotion = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    syncReducedMotion()
    mediaQuery.addEventListener('change', syncReducedMotion)

    return () => {
      mediaQuery.removeEventListener('change', syncReducedMotion)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry?.isIntersecting ?? false)
      },
      { threshold: 0.25 },
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    const shouldPlay = shouldPlayMosaicAmbientVideo({
      prefersReducedMotion,
      isIntersecting,
    })

    if (shouldPlay) {
      void video.play().catch(() => {
        video.pause()
      })
    } else {
      video.pause()
    }
  }, [prefersReducedMotion, isIntersecting])

  return (
    <div
      ref={containerRef}
      className={MOSAIC_TILE_FRAME_CLASS}
      style={getMosaicTileGridStyle(tile)}
    >
      <video
        ref={videoRef}
        aria-label={alt}
        className='size-full object-cover'
        muted
        playsInline
        loop
        preload='metadata'
      >
        <source src={src} type={mimeType} />
      </video>
    </div>
  )
}

const MosaicVideoTile = ({ tile }: MosaicVideoTileProps) => {
  const tileVideo = getMosaicVideoTileProps(tile)

  if (!tileVideo) {
    return null
  }

  return <MosaicVideoTilePlayer tile={tile} tileVideo={tileVideo} />
}

export default MosaicVideoTile
