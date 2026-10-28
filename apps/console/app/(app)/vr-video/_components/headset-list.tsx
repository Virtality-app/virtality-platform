'use client'

import type { HeadsetListItem } from '@/lib/vr-video-page-state'
import { useClientT } from '@/i18n/use-client-t'
import { headsetStorageSubtitle } from '@/lib/headset-library-format'
import { HeadsetListRow } from './headset-list-row'

export function HeadsetList({
  headsets,
  selectedId,
  onSelect,
}: {
  headsets: HeadsetListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { t, i18n } = useClientT('vr-video')

  if (headsets.length === 0) {
    return (
      <p className='text-muted-foreground text-sm'>{t('headsets.empty')}</p>
    )
  }

  return (
    <div className='flex flex-col gap-1'>
      {headsets.map((headset) => (
        <HeadsetListRow
          key={headset.id}
          name={headset.name}
          online={headset.online}
          readyCount={headset.readyCount}
          totalCount={headset.totalCount}
          subtitle={headsetStorageSubtitle(
            {
              online: headset.online,
              freeBytes: headset.freeBytes,
              reportedAt: headset.reportedAt,
            },
            t,
            i18n.language,
          )}
          usedBytes={headset.usedBytes}
          freeBytes={headset.freeBytes ?? 0}
          selected={headset.id === selectedId}
          onSelect={() => onSelect(headset.id)}
        />
      ))}
    </div>
  )
}
