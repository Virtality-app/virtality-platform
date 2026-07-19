'use client'

import { useEffect, useRef, useState } from 'react'
import CredibilityLogo from '@/components/home/credibility-logo'
import CredibilitySectionHeader from '@/components/home/credibility-section-header'
import {
  PRESS_LOGO_ITEMS,
  PRESS_SECTION_CONTENT,
  type PressLogoItem,
} from '@/lib/partner-press-content'
import { filterValidLogoItems, getPressLinkProps } from '@/lib/partner-press'
import { cn } from '@/lib/utils'

const PRESS_MARQUEE_GAP_CLASS = 'gap-8 pe-8 md:gap-10 md:pe-10'
const PRESS_MARQUEE_DURATION_MS = 40_000
const PRESS_MARQUEE_DRAG_THRESHOLD_PX = 4

function getPressLogoClassName(item: PressLogoItem): string {
  if (item.wide) {
    // Compact wordmarks (short aspect) share wide height but a tighter width.
    if (item.compact) {
      return 'h-8 w-16 md:h-10 md:w-24'
    }

    return 'h-8 w-36 md:h-10 md:w-44'
  }

  return 'size-14 md:size-16'
}

function PressLogo({ item }: { item: PressLogoItem }) {
  const logo = (
    <CredibilityLogo
      item={item}
      size='secondary'
      className={getPressLogoClassName(item)}
    />
  )
  const href = item.href?.trim()

  if (!href) {
    return <div className='inline-flex shrink-0'>{logo}</div>
  }

  return (
    <a
      href={href}
      {...getPressLinkProps(href)}
      className='inline-flex shrink-0'
      draggable={false}
    >
      {logo}
    </a>
  )
}

function wrapMarqueeOffset(value: number, halfWidth: number): number {
  if (halfWidth <= 0) {
    return value
  }

  let next = value % halfWidth
  if (next > 0) {
    next -= halfWidth
  }

  return next
}

function PressMarquee({ items }: { items: PressLogoItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const halfWidthRef = useRef(0)
  const isDraggingRef = useRef(false)
  const isHoverPausedRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)
  const dragOriginXRef = useRef(0)
  const dragOriginOffsetRef = useRef(0)
  const didDragRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) {
      return
    }

    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2
      offsetRef.current = wrapMarqueeOffset(
        offsetRef.current,
        halfWidthRef.current,
      )
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(track)

    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotionRef.current = media.matches

    const onChange = () => {
      prefersReducedMotionRef.current = media.matches
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    let frame = 0
    let last = performance.now()

    const applyTransform = () => {
      const track = trackRef.current
      if (!track) {
        return
      }

      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
    }

    const tick = (now: number) => {
      const dt = now - last
      last = now
      const halfWidth = halfWidthRef.current

      if (
        halfWidth > 0 &&
        !isDraggingRef.current &&
        !isHoverPausedRef.current &&
        !prefersReducedMotionRef.current
      ) {
        offsetRef.current = wrapMarqueeOffset(
          offsetRef.current - (halfWidth * dt) / PRESS_MARQUEE_DURATION_MS,
          halfWidth,
        )
      }

      applyTransform()
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const endDrag = () => {
    if (!isDraggingRef.current) {
      return
    }

    isDraggingRef.current = false
    setIsDragging(false)
  }

  return (
    <div
      className={cn(
        'relative mt-2 w-full touch-pan-y overflow-hidden select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
      )}
      onPointerDown={(event) => {
        if (event.button !== 0) {
          return
        }

        isDraggingRef.current = true
        setIsDragging(true)
        didDragRef.current = false
        dragOriginXRef.current = event.clientX
        dragOriginOffsetRef.current = offsetRef.current
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (!isDraggingRef.current) {
          return
        }

        const deltaX = event.clientX - dragOriginXRef.current
        if (Math.abs(deltaX) > PRESS_MARQUEE_DRAG_THRESHOLD_PX) {
          didDragRef.current = true
        }

        offsetRef.current = wrapMarqueeOffset(
          dragOriginOffsetRef.current + deltaX,
          halfWidthRef.current,
        )

        const track = trackRef.current
        if (track) {
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        }
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(event) => {
        if (!didDragRef.current) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        didDragRef.current = false
      }}
      onMouseEnter={() => {
        isHoverPausedRef.current = true
      }}
      onMouseLeave={() => {
        isHoverPausedRef.current = false
      }}
      role='region'
      aria-label='Press logos'
    >
      <div
        className='pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent sm:w-24'
        aria-hidden
      />
      <div
        className='pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent sm:w-24'
        aria-hidden
      />

      <div
        ref={trackRef}
        className='flex w-max will-change-transform [&_img]:pointer-events-none'
      >
        <div className={cn('flex items-center', PRESS_MARQUEE_GAP_CLASS)}>
          {items.map((item) => (
            <PressLogo key={item.alt} item={item} />
          ))}
        </div>
        <div
          className={cn('flex items-center', PRESS_MARQUEE_GAP_CLASS)}
          aria-hidden
        >
          {items.map((item) => (
            <PressLogo key={`${item.alt}-clone`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

type PressLogosProps = {
  className?: string
}

const PressLogos = ({ className }: PressLogosProps) => {
  const pressItems = filterValidLogoItems(PRESS_LOGO_ITEMS)

  if (pressItems.length === 0) {
    return null
  }

  return (
    <div className={cn(className)}>
      <CredibilitySectionHeader content={PRESS_SECTION_CONTENT} />
      <PressMarquee items={pressItems} />
    </div>
  )
}

export default PressLogos
