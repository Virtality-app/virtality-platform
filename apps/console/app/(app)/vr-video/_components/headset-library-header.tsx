'use client'

import { HeadsetPresenceDot } from './headset-presence-dot'

export function HeadsetLibraryHeader({
  name,
  online,
  subtitle,
}: {
  name: string
  online: boolean
  subtitle: string
}) {
  return (
    <div className='mb-4 flex items-start gap-2'>
      <HeadsetPresenceDot online={online} />
      <div>
        <h2 className='font-semibold'>{name}</h2>
        <p className='text-muted-foreground text-sm'>{subtitle}</p>
      </div>
    </div>
  )
}
