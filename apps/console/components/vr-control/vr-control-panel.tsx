import { CheckCircle, Loader2, X } from 'lucide-react'
import { Button } from '@virtality/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@virtality/ui/components/select'
import { VRDevice } from '@/types/models'
import { MouseEvent } from 'react'
import useSocketConnection, {
  type SocketConnectionState,
} from '@/hooks/use-socket-connection'
import { useStore } from 'tinybase/ui-react'
import { useClientT } from '@/i18n/use-client-t'
import i18next from '@/i18n/i18next'
import { notify } from '@/lib/notify'
import { cn } from '@/lib/utils'
import { usePatientDashboard } from '@/context/patient-dashboard-context'
import { useVrPresencePolling } from '@/hooks/use-vr-presence-polling'
import { isDashboardDeviceSelectable } from '@/lib/patient-dashboard-device-selection'
import { isReplacementNoticeError } from '@/lib/socket-replacement-notice'
import { DevicePresenceStatus } from './device-presence-status'

function isDashboardDeviceRowDisabled(device: VRDevice): boolean {
  return device.socket.connected || !isDashboardDeviceSelectable(device.data)
}

function getClientConnectionBadgeClass(
  connectionState: SocketConnectionState,
  connected: boolean,
): string {
  if (connectionState === 'connecting' || connectionState === 'reconnecting') {
    return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
  }

  return connected
    ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300'
    : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
}

function getClientConnectionLabel(
  connectionState: SocketConnectionState,
  reconnectAttempt: number,
  connected: boolean,
  connectionError: string | null,
): string {
  switch (connectionState) {
    case 'connecting':
      return i18next.t('vrControl.connecting')
    case 'reconnecting':
      return i18next.t('vrControl.reconnecting', { attempt: reconnectAttempt })
    case 'failed':
      return isReplacementNoticeError(connectionError)
        ? i18next.t('vrControl.replaced')
        : (connectionError ?? i18next.t('vrControl.failed'))
    default:
      return connected
        ? i18next.t('vrControl.connected')
        : i18next.t('vrControl.disconnected')
  }
}

type VRControlPanelProps = {
  devices: VRDevice[]
  isOpen: boolean
}

const VRControlPanel = ({ devices, isOpen }: VRControlPanelProps) => {
  const { t } = useClientT(['patient-dashboard', 'common'])
  const { state, handler, patientId } = usePatientDashboard()
  const { selectedDevice } = state
  const { setSelectedDevice } = handler

  const store = useStore()
  const {
    connected,
    connectionState,
    reconnectAttempt,
    connectionError,
    connect,
    disconnect,
  } = useSocketConnection({ device: selectedDevice })
  const replaced = isReplacementNoticeError(connectionError)
  const presenceByDeviceId = useVrPresencePolling({
    enabled: isOpen,
    devices: devices.map((device) => device.data),
  })

  const handleVRConnection = async () => {
    const deviceId = selectedDevice?.data.deviceId

    if (!selectedDevice || !deviceId) {
      return notify.error({
        key: 'vrControl.notPaired',
        ns: 'patient-dashboard',
      })
    }

    if (!connected) {
      selectedDevice.mutations.setDeviceRoomCode(deviceId)
      try {
        await connect({ timeoutMs: 10_500 })
      } catch (error) {
        notify.error(
          error instanceof Error ? error.message : t('vrControl.connectFailed'),
        )
      }
    } else {
      disconnect()
    }
  }

  const handleDeviceSelection = (value: string) => {
    const device = devices?.find((device) => device.data.id === value) ?? null
    if (device && !isDashboardDeviceSelectable(device.data)) {
      return
    }
    setSelectedDevice(device)
    store?.setCell('patients', patientId, 'lastHeadset', device?.data.id ?? '')
  }

  const clearDeviceSelection = () => {
    setSelectedDevice(null)
    store?.delCell('patients', patientId, 'lastHeadset')
  }

  const handleDeviceSelectionClear = (e: MouseEvent) => {
    e.stopPropagation()
    clearDeviceSelection()
  }

  const renderClientStatus = (className?: string) => (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium',
        getClientConnectionBadgeClass(connectionState, connected),
        className,
      )}
    >
      {connected && <CheckCircle className='size-3.5' />}
      {(connectionState === 'connecting' ||
        connectionState === 'reconnecting') && (
        <Loader2 className='size-3.5 animate-spin' />
      )}
      {getClientConnectionLabel(
        connectionState,
        reconnectAttempt,
        connected,
        connectionError,
      )}
    </span>
  )

  const renderDeviceSelect = () => (
    <div className='relative'>
      <Select
        value={selectedDevice?.data.id ?? ''}
        onValueChange={handleDeviceSelection}
      >
        <SelectTrigger className='w-full' disabled={connected || replaced}>
          <SelectValue placeholder={t('vrControl.selectDevice')} />
        </SelectTrigger>

        <SelectContent className='dark:bg-zinc-700'>
          {devices?.map((device) => {
            return (
              <SelectItem
                disabled={isDashboardDeviceRowDisabled(device)}
                key={device.data.id}
                value={device.data.id}
              >
                <div className='flex w-full items-center justify-between gap-3'>
                  <span>{device.data.name}</span>
                  <DevicePresenceStatus
                    status={presenceByDeviceId[device.data.id] ?? 'unpaired'}
                  />
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      {selectedDevice && (
        <Button
          onClick={handleDeviceSelectionClear}
          size='icon'
          variant='ghost'
          disabled={connected || replaced}
          className='absolute top-2.5 right-7.5 size-4 rounded-sm hover:bg-zinc-200 hover:dark:bg-zinc-600'
        >
          <X className='p-0.5' />
        </Button>
      )}
    </div>
  )

  const renderConnectionButton = (className?: string) => (
    <Button
      variant={connected ? 'destructive' : 'primary'}
      onClick={handleVRConnection}
      disabled={replaced}
      className={cn('w-full', className)}
    >
      {connected
        ? t('vrControl.disconnect')
        : connectionState === 'failed'
          ? t('common:btn.retry')
          : t('vrControl.connect')}
    </Button>
  )

  return (
    <div className='space-y-4 p-3'>
      <div className='grid grid-cols-[3px_1fr] gap-x-3'>
        <span
          className={cn(
            'rounded-full',
            connected ? 'bg-green-500' : 'bg-red-500',
          )}
        />

        <div className='space-y-5'>
          <div className='space-y-1'>
            <div className='flex items-center justify-between gap-2'>
              <h1 className='text-sm font-semibold'>{t('vrControl.client')}</h1>
              {renderClientStatus()}
            </div>
            <p className='text-muted-foreground text-xs'>
              {t('vrControl.clientDescription')}
            </p>
          </div>

          <div className='space-y-2'>
            <h2 className='text-sm font-semibold'>{t('vrControl.device')}</h2>
            {renderDeviceSelect()}
          </div>
        </div>
      </div>

      {renderConnectionButton()}
    </div>
  )
}

export default VRControlPanel
