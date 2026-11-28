'use client'

// PROTOTYPE: floating variant switcher for throwaway /prototype routes.
// Hidden on the production site (NEXT_PUBLIC_ENV=production).
import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PrototypeSwitcherProps = {
  variants: { key: string; name: string }[]
  current: string
  views?: { key: string; name: string }[]
  currentView?: string
  /** Shown under the label so the state on screen is visible. */
  status?: string
}

const PrototypeSwitcher = ({
  variants,
  current,
  views,
  currentView,
  status,
}: PrototypeSwitcherProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const index = Math.max(
    0,
    variants.findIndex((variant) => variant.key === current),
  )

  const go = (params: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(params)) next.set(key, value)
    router.replace(`${pathname}?${next.toString()}`, { scroll: false })
  }

  const step = (delta: number) => {
    const next = (index + delta + variants.length) % variants.length
    go({ variant: variants[next].key })
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }
      if (event.key === 'ArrowLeft') step(-1)
      if (event.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (process.env.NEXT_PUBLIC_ENV === 'production') return null

  const variant = variants[index]

  return (
    <div className='fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-950 p-1.5 text-white shadow-2xl ring-1 ring-white/10'>
      <button
        type='button'
        onClick={() => step(-1)}
        aria-label='Previous variant'
        className='grid size-9 place-items-center rounded-full hover:bg-white/10'
      >
        <ChevronLeft className='size-4' />
      </button>
      <div className='min-w-44 px-2 text-center'>
        <p className='text-sm font-semibold'>
          {variant.key} ({variant.name})
        </p>
        {status ? <p className='text-[11px] text-white/60'>{status}</p> : null}
      </div>
      <button
        type='button'
        onClick={() => step(1)}
        aria-label='Next variant'
        className='grid size-9 place-items-center rounded-full hover:bg-white/10'
      >
        <ChevronRight className='size-4' />
      </button>
      {views ? (
        <div className='ml-1 flex rounded-full bg-white/10 p-0.5'>
          {views.map((view) => (
            <button
              key={view.key}
              type='button'
              onClick={() => go({ view: view.key })}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold',
                view.key === currentView
                  ? 'bg-white text-zinc-950'
                  : 'text-white/70 hover:text-white',
              )}
            >
              {view.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default PrototypeSwitcher
