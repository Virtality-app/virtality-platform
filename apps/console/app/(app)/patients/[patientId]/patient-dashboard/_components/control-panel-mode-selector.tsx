'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@virtality/ui/components/select'
import { PatientDashboardValue } from '@/context/patient-dashboard-context'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@virtality/ui/components/tooltip'
import {
  canEnterImmersiveMode,
  isDashboardMode,
  isLeavingImmersiveLocked,
  isProgramModeSwitchLocked,
} from '@/lib/control-panel-mode'
import { useClientT } from '@/i18n/use-client-t'
import type { ImmersivePlaybackStatus } from '@/lib/immersive-video-playback-reducer'

interface ModeSelectorProps {
  selectedMode: PatientDashboardValue['state']['selectedMode']
  setSelectedMode: PatientDashboardValue['handler']['setSelectedMode']
  programState: PatientDashboardValue['state']['programState']
  playbackStatus: ImmersivePlaybackStatus
  frozen?: boolean
}

const ModeSelector = ({
  selectedMode,
  setSelectedMode,
  programState,
  playbackStatus,
  frozen = false,
}: ModeSelectorProps) => {
  const { t } = useClientT('patient-dashboard')
  const programLocked = isProgramModeSwitchLocked(programState)
  const leavingLocked =
    selectedMode === 'immersive' && isLeavingImmersiveLocked(playbackStatus)
  const triggerDisabled = programLocked || leavingLocked || frozen

  const handleModeChange = (value: string) => {
    if (!isDashboardMode(value)) return
    if (value === 'immersive' && !canEnterImmersiveMode(programState)) return
    if (leavingLocked && value !== 'immersive') return
    setSelectedMode(value)
  }

  const trigger = (
    <SelectTrigger
      disabled={triggerDisabled}
      className='border dark:border-zinc-600 dark:bg-zinc-900'
    >
      <SelectValue placeholder={t('mode.placeholder')} />
    </SelectTrigger>
  )

  return (
    <TooltipProvider delayDuration={200}>
      <Select
        defaultValue='main'
        value={selectedMode}
        onValueChange={handleModeChange}
      >
        {leavingLocked ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='inline-flex'>
                {trigger}
                <span className='sr-only'>{t('mode.leaveImmersiveHint')}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t('mode.leaveImmersiveHint')}</TooltipContent>
          </Tooltip>
        ) : (
          trigger
        )}
        <SelectContent className='dark:bg-zinc-900'>
          <SelectItem key='free' value='free'>
            {t('mode.free')}
          </SelectItem>
          <SelectItem key='main' value='main'>
            {t('mode.main')}
          </SelectItem>
          <SelectItem
            key='immersive'
            value='immersive'
            disabled={!canEnterImmersiveMode(programState)}
          >
            {t('mode.immersive')}
          </SelectItem>
        </SelectContent>
      </Select>
    </TooltipProvider>
  )
}

export default ModeSelector
