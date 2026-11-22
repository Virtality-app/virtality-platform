'use client'
import { X } from 'lucide-react'
import { markedBodyAreas, type MarkedBodyArea } from '@/lib/body-areas'
import { BodyAreas } from '@/types/models'
import { cn } from '@/lib/utils'
import { useClientT } from '@/i18n/use-client-t'

type MarkedBodyAreasProps = {
  bodyAreas: BodyAreas
  onUnmark: (area: MarkedBodyArea) => void
  className?: string
}

/**
 * The legend, then a chip for every part marked on either view. Tapping a
 * chip unmarks it, which is easier on a tablet than finding a small muscle.
 */
const MarkedBodyAreas = ({
  bodyAreas,
  onUnmark,
  className,
}: MarkedBodyAreasProps) => {
  const { t } = useClientT('patients')
  const marked = markedBodyAreas(bodyAreas)

  return (
    <div className={cn('flex min-w-0 flex-col gap-3.5', className)}>
      <div className='flex items-center gap-3.5 text-xs text-zinc-500 dark:text-zinc-400'>
        <span className='flex items-center gap-1.5'>
          <span className='size-2.5 rounded-[3px] bg-zinc-200 dark:bg-zinc-700' />
          {t('profile.unaffected')}
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='size-2.5 rounded-[3px] bg-red-700' />
          {t('profile.painful')}
        </span>
      </div>
      <div>
        <h3 className='mb-2 text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300'>
          {t('profile.markedAreas')}
        </h3>
        {marked.length > 0 ? (
          <ul className='flex flex-wrap gap-2'>
            {marked.map((area) => {
              const part = t(`bodyParts.${area.part}`)
              const label =
                area.view === 'back' ? t('profile.backPart', { part }) : part
              return (
                <li key={`${area.view}-${area.part}`}>
                  <button
                    type='button'
                    onClick={() => onUnmark(area)}
                    aria-label={t('profile.unmarkArea', { part: label })}
                    className='flex min-h-9 touch-manipulation items-center gap-1.5 rounded-full bg-red-50 pr-2.5 pl-3 text-[13px] font-medium text-red-700 transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-red-100 active:bg-red-100 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-950 dark:active:bg-red-950'
                  >
                    {label}
                    <X className='size-3.5 opacity-70' />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className='text-[12.5px] text-zinc-400 dark:text-zinc-500'>
            {t('profile.noMarkedAreas')}
          </p>
        )}
      </div>
    </div>
  )
}

export default MarkedBodyAreas
