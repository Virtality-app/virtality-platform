import { useClientT } from '@/i18n/use-client-t'
import { cn } from '@/lib/utils'

export function SelectionOptions({
  quickStartHandler,
  className,
  onlyQuickStart,
}: {
  quickStartHandler: () => void
  className?: string
  onlyQuickStart?: boolean
}) {
  const { t } = useClientT('patient-dashboard')
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {!onlyQuickStart && (
        <span className='md:max-lg:hidden'>{t('programSelector.select')}</span>
      )}
      {!onlyQuickStart && (
        <span className='md:max-lg:hidden'>{t('programSelector.or')}</span>
      )}
      <div
        role='button'
        onClick={quickStartHandler}
        className='text-vital-blue-700 flex items-center justify-between hover:underline'
      >
        {t('programSelector.quickStart')}
      </div>
    </div>
  )
}
