'use client'

import { HeadsetStatusLine } from './headset-status-line'

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
    <div className='mb-4'>
      <h2 className='font-semibold'>{name}</h2>
      <HeadsetStatusLine
        online={online}
        subtitle={subtitle}
        className='text-sm'
      />
    </div>
  )
}
