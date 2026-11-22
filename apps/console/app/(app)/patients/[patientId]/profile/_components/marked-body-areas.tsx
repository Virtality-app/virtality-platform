'use client'
import { markedBodyAreas } from '@/lib/body-areas'
import { BodyAreas } from '@/types/models'
import { useClientT } from '@/i18n/use-client-t'

/** The legend, then a chip for every part marked on either view. */
const MarkedBodyAreas = ({ bodyAreas }: { bodyAreas: BodyAreas }) => {
  const { t } = useClientT('patients')
  const marked = markedBodyAreas(bodyAreas)

  return (
    <div className='flex min-w-50 flex-1 flex-col gap-3.5'>
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
          <ul className='flex flex-wrap gap-1.5'>
            {marked.map(({ view, part }) => {
              const label = t(`bodyParts.${part}`)
              return (
                <li
                  key={`${view}-${part}`}
                  className='rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/60 dark:text-red-300'
                >
                  {view === 'back'
                    ? t('profile.backPart', { part: label })
                    : label}
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
