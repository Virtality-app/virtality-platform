'use client'

import Link from 'next/link'
import { RectangleGoggles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isHeadsetSelectable } from '@/lib/home-session-picker'
import { withReturnTo } from '@/lib/home-picker-return'
import { useClientT } from '@/i18n/use-client-t'
import type { DeviceVrPresenceStatus } from '@/lib/vr-presence-status'
import type { HomeDashboardData } from './use-home-dashboard-data'
import StartSessionStep from './start-session-step'
import StartSessionOption from './start-session-option'
import type { StartSessionPicker } from './use-start-session-picker'

const presenceKey = {
  online: 'startSession.presence.online',
  offline: 'startSession.presence.offline',
  loading: 'startSession.presence.loading',
  unpaired: 'startSession.presence.unpaired',
} as const satisfies Record<DeviceVrPresenceStatus, string>

const StartSessionHeadsetStep = ({
  devices,
  presenceById,
  picker,
}: {
  devices: HomeDashboardData['devices']
  presenceById: HomeDashboardData['presenceById']
  picker: StartSessionPicker
}) => {
  const { t } = useClientT('home')
  const { selection, selectDevice, returnTo } = picker

  return (
    <StartSessionStep
      number={3}
      label={t('startSession.headset')}
      tourTarget='session-headset'
      done={Boolean(selection.deviceId)}
      footer={
        <Link
          href={withReturnTo('/devices', returnTo)}
          className='text-muted-foreground hover:text-foreground flex items-center gap-2 text-[13px]'
        >
          <RectangleGoggles className='size-4' />{' '}
          {t('startSession.pairHeadset')}
        </Link>
      }
    >
      {devices.length === 0 ? (
        <p className='text-muted-foreground text-[13px]'>
          {t('startSession.noHeadsets')}
        </p>
      ) : null}
      {devices.map(({ data }) => {
        const status = presenceById[data.id] ?? 'unpaired'
        const selectable = isHeadsetSelectable(status)
        return (
          <StartSessionOption
            key={data.id}
            selected={selection.deviceId === data.id}
            disabled={!selectable}
            onSelect={() => selectDevice(data.id)}
          >
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                status === 'online' && 'bg-green-600 dark:bg-green-400',
                status === 'loading' && 'bg-muted-foreground animate-pulse',
                (status === 'offline' || status === 'unpaired') &&
                  'bg-muted-foreground',
              )}
              aria-hidden
            />
            <div className='min-w-0 flex-1'>
              <div className='truncate'>
                {data.model ? `${data.model} · ` : ''}
                {data.name}
              </div>
              <small className='text-muted-foreground block text-xs'>
                {t(presenceKey[status])}
              </small>
            </div>
          </StartSessionOption>
        )
      })}
    </StartSessionStep>
  )
}

export default StartSessionHeadsetStep
