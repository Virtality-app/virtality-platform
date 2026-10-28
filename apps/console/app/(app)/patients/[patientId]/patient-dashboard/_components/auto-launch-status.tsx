'use client'

import { Loader2 } from 'lucide-react'
import { Item } from '@/components/ui/item'
import { useClientT } from '@/i18n/use-client-t'

/** Shown while a launch handed over from the home dashboard is still armed. */
const AutoLaunchStatus = ({ connected }: { connected: boolean }) => {
  const { t } = useClientT('patient-dashboard')
  return (
    <Item
      variant='outline'
      size='sm'
      className='border-vital-blue-700/40 text-vital-blue-800 dark:text-vital-blue-300 max-h-9 gap-2 p-1 px-2 text-xs'
      aria-live='polite'
    >
      <Loader2 className='size-3.5 animate-spin' />
      {connected ? t('autoLaunch.waiting') : t('autoLaunch.connecting')}
    </Item>
  )
}

export default AutoLaunchStatus
