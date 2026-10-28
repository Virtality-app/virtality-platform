import { Loader2 } from 'lucide-react'
import { useClientT } from '@/i18n/use-client-t'

export function CastingLoadingState() {
  const { t } = useClientT('patient-dashboard')
  return (
    <div className='bg-muted/40 text-muted-foreground absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg border'>
      <Loader2 className='size-8 animate-spin' />
      <p className='text-sm font-medium'>{t('casting.connecting')}</p>
    </div>
  )
}
