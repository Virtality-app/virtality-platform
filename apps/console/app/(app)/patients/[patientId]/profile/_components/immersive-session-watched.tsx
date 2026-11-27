'use client'

import type { SessionImmersiveVideo } from '@virtality/db'
import { useClientT } from '@/i18n/use-client-t'
import { getImmersiveWatched } from '@/lib/immersive-session-display'

/** "7:32 of 15:00 (50%)" with a bar, or the plain position, or "not reported". */
const ImmersiveSessionWatched = ({
  video,
}: {
  video: SessionImmersiveVideo
}) => {
  const { t } = useClientT('patients')
  const { watched, total, percent } = getImmersiveWatched(video)

  if (watched == null) {
    return (
      <span className='text-muted-foreground'>
        {t('session.immersive.notReported')}
      </span>
    )
  }
  if (total == null || percent == null) {
    return <span className='tabular-nums'>{watched}</span>
  }

  return (
    <span className='flex flex-col items-end gap-1.5'>
      <span className='tabular-nums'>
        {t('session.immersive.watchedOf', { watched, total, percent })}
      </span>
      <span
        aria-hidden
        className='bg-muted block h-1.5 w-32 overflow-hidden rounded-full'
      >
        <span
          className='block h-full rounded-full bg-[hsl(160_95%_30%)] dark:bg-[hsl(150_90%_45%)]'
          style={{ width: `${percent}%` }}
        />
      </span>
    </span>
  )
}

export default ImmersiveSessionWatched
