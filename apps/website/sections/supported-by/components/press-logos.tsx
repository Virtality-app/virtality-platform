'use client'

import { useEffect, useRef, useState } from 'react'
import CredibilityLogo from './credibility-logo'
import CredibilitySectionHeader from './credibility-section-header'
import {
  PRESS_LOGO_ITEMS,
  PRESS_SECTION_CONTENT,
  type PressLogoItem,
} from '../content'
import { filterValidLogoItems, getPressLinkProps } from '../lib/partner-press'
import {
  initialMarqueeDragState,
  isMarqueeAutoScrollPaused,
  marqueeOffsetDuringPointer,
  reduceMarqueeDrag,
  type MarqueeDragState,
} from '../lib/press-marquee-interaction'
import { cn } from '@/lib/utils'

const PRESS_MARQUEE_GAP_CLASS = 'gap-8 pe-8 md:gap-10 md:pe-10'
const PRESS_MARQUEE_DURATION_MS = 40_000

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
  const dragStateRef = useRef<MarqueeDragState>(initialMarqueeDragState)
  const isHoverPausedRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)
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
        !isMarqueeAutoScrollPaused(
          dragStateRef.current,
          isHoverPausedRef.current,
          prefersReducedMotionRef.current,
        )
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

  useEffect(() => {
    // Opening target=_blank can drop pointerup; clear any stale gesture.
    const resetStaleGesture = () => {
      if (dragStateRef.current.phase === 'idle') {
        return
      }

      dragStateRef.current = reduceMarqueeDrag(dragStateRef.current, {
        type: 'pointercancel',
      }).state
      setIsDragging(false)
    }

    window.addEventListener('blur', resetStaleGesture)
    document.addEventListener('visibilitychange', resetStaleGesture)
    return () => {
      window.removeEventListener('blur', resetStaleGesture)
      document.removeEventListener('visibilitychange', resetStaleGesture)
    }
  }, [])

  const applyDragResult = (
    result: ReturnType<typeof reduceMarqueeDrag>,
    options?: { target?: HTMLDivElement; pointerId?: number },
  ) => {
    dragStateRef.current = result.state
    setIsDragging(result.state.phase === 'dragging')

    if (
      result.capturePointer &&
      options?.target &&
      options.pointerId !== undefined
    ) {
      options.target.setPointerCapture(options.pointerId)
    }
  }

  const syncOffsetFromPointer = (clientX: number) => {
    const nextOffset = marqueeOffsetDuringPointer(dragStateRef.current, clientX)
    if (nextOffset === null) {
      return
    }

    offsetRef.current = wrapMarqueeOffset(nextOffset, halfWidthRef.current)

    const track = trackRef.current
    if (track) {
      track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
    }
  }

  const endPointerGesture = (
    type: 'pointerup' | 'pointercancel' | 'lostcapture',
  ) => {
    applyDragResult(reduceMarqueeDrag(dragStateRef.current, { type }))
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

        applyDragResult(
          reduceMarqueeDrag(dragStateRef.current, {
            type: 'pointerdown',
            x: event.clientX,
            offset: offsetRef.current,
          }),
        )
      }}
      onPointerMove={(event) => {
        if (dragStateRef.current.phase === 'idle') {
          return
        }

        // Dropped pointerup (e.g. new tab) can leave a stale pending gesture.
        if (
          dragStateRef.current.phase === 'pending' &&
          (event.buttons & 1) === 0
        ) {
          endPointerGesture('pointercancel')
          return
        }

        const result = reduceMarqueeDrag(dragStateRef.current, {
          type: 'pointermove',
          x: event.clientX,
        })
        applyDragResult(result, {
          target: event.currentTarget,
          pointerId: event.pointerId,
        })
        syncOffsetFromPointer(event.clientX)
      }}
      onPointerUp={() => endPointerGesture('pointerup')}
      onPointerCancel={() => endPointerGesture('pointercancel')}
      onLostPointerCapture={() => endPointerGesture('lostcapture')}
      onClickCapture={(event) => {
        const result = reduceMarqueeDrag(dragStateRef.current, {
          type: 'consumeClickGuard',
        })
        dragStateRef.current = result.state

        if (!result.preventClick) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
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
