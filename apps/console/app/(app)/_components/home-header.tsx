'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function homeGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const HomeHeader = ({
  name,
  now,
  isPending,
}: {
  name: string | undefined
  now: Date
  isPending: boolean
}) => {
  const firstName = name?.trim().split(/\s+/)[0]

  return (
    <div>
      <p className='text-muted-foreground text-[11px] font-semibold tracking-[0.08em] uppercase'>
        Dashboard
      </p>
      <h1 className='text-3xl leading-10 font-bold text-balance'>
        {isPending ? (
          <Skeleton className='inline-block h-8 w-64 align-middle' />
        ) : (
          <>
            {homeGreeting(now.getHours())}
            {firstName ? `, ${firstName}` : ''}
          </>
        )}
      </h1>
    </div>
  )
}

export default HomeHeader
