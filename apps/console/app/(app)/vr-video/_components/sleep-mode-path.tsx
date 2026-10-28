'use client'

import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Trans } from 'react-i18next'
import { useClientT } from '@/i18n/use-client-t'
import { MetaButtonIcon } from './meta-button-icon'

const STEP_KEYS = [
  'sleepPath.settings',
  'sleepPath.general',
  'sleepPath.power',
  'sleepPath.sleepMode',
]

export function SleepModePath() {
  const { t } = useClientT('vr-video')

  return (
    <div className='text-muted-foreground mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm'>
      <span className='text-foreground inline-flex items-center gap-1.5'>
        <Trans
          t={t}
          i18nKey='sleepPath.pressMeta'
          components={{ icon: <MetaButtonIcon /> }}
        />
      </span>
      {STEP_KEYS.map((key) => (
        <Fragment key={key}>
          <ChevronRight className='size-4 shrink-0' aria-hidden='true' />
          <span className='text-foreground'>{t(key)}</span>
        </Fragment>
      ))}
    </div>
  )
}
