'use client'

import type { PartnerLogoListItem } from '@virtality/shared/types'
import Image from 'next/image'
import type { ReactNode } from 'react'

type PartnerLogoCategoryListProps = {
  title: string
  description: string
  logos: PartnerLogoListItem[]
  isLoading?: boolean
}

function PartnerLogoList({ logos }: { logos: PartnerLogoListItem[] }) {
  return (
    <ul className='space-y-3'>
      {logos.map((logo) => (
        <li
          key={logo.id}
          className='flex items-center gap-4 rounded-lg border p-3'
        >
          <Image
            src={logo.cdnUrl}
            alt={logo.alt}
            width={64}
            height={64}
            className='size-16 rounded bg-white object-contain p-1'
          />
          <div className='min-w-0 flex-1'>
            <p className='font-medium'>{logo.alt}</p>
            <p className='text-muted-foreground truncate font-mono text-xs'>
              {logo.objectKey}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export const PartnerLogoCategoryList = ({
  title,
  description,
  logos,
  isLoading = false,
}: PartnerLogoCategoryListProps) => {
  let body: ReactNode

  if (isLoading) {
    body = (
      <p className='text-muted-foreground text-sm'>Loading partner logos...</p>
    )
  } else if (logos.length === 0) {
    body = (
      <p className='text-muted-foreground rounded-lg border border-dashed p-6 text-sm'>
        No logos assigned yet.
      </p>
    )
  } else {
    body = <PartnerLogoList logos={logos} />
  }

  return (
    <section className='space-y-4 rounded-lg border p-6'>
      <div>
        <h2 className='text-xl font-semibold'>{title}</h2>
        <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
      </div>
      {body}
    </section>
  )
}
