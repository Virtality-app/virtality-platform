'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/** One selectable row inside a Start a session step. */
const StartSessionOption = ({
  selected,
  disabled,
  onSelect,
  children,
  className,
}: {
  selected: boolean
  disabled?: boolean
  onSelect: () => void
  children: React.ReactNode
  className?: string
}) => {
  const ref = useRef<HTMLButtonElement>(null)

  // Bring a picked row into view inside its list (e.g. one created elsewhere
  // and picked on return) without scrolling the page.
  useEffect(() => {
    const el = ref.current
    const list = el?.closest<HTMLElement>('[data-scroll-list]')
    if (!selected || !el || !list) return
    const top =
      el.getBoundingClientRect().top -
      list.getBoundingClientRect().top +
      list.scrollTop
    if (top < list.scrollTop) list.scrollTop = top
    else if (top + el.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = top + el.offsetHeight - list.clientHeight
  }, [selected])

  return (
    <button
      ref={ref}
      type='button'
      role='option'
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onSelect}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left text-sm transition-colors',
        'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
        !disabled && 'hover:bg-muted',
        selected &&
          'border-vital-blue-700 bg-vital-blue-50 dark:border-vital-blue-500 dark:bg-vital-blue-500/10',
        disabled && 'cursor-not-allowed opacity-55',
        className,
      )}
    >
      {children}
    </button>
  )
}

export default StartSessionOption
