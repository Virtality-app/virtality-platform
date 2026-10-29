'use client'

import { Skeleton } from '@virtality/ui/components/skeleton'
import { useClientT } from '@/i18n/use-client-t'

export function homeGreetingKey(hour: number) {
  if (hour < 12) return 'header.greetingMorning'
  if (hour < 18) return 'header.greetingAfternoon'
  return 'header.greetingEvening'
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
  const { t } = useClientT('home')
  const firstName = name?.trim().split(/\s+/)[0]

  return (
    <div>
      <p className='text-muted-foreground text-[11px] font-semibold tracking-[0.08em] uppercase'>
        {t('header.dashboard')}
      </p>
      <h1 className='text-3xl leading-10 font-bold text-balance'>
        {isPending ? (
          <Skeleton className='inline-block h-8 w-64 align-middle' />
        ) : (
          <>
            {t(homeGreetingKey(now.getHours()))}
            {firstName ? `, ${firstName}` : ''}
          </>
        )}
      </h1>
    </div>
  )
}

export default HomeHeader
