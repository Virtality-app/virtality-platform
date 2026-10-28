import i18next from '@/i18n/i18next'
import type { HeadsetLibraryCell } from '@/lib/headset-library-rows'
import { formatDurationLabel } from '@/lib/headset-library-format'

/**
 * A video the mirror says the headset holds can be picked before the headset
 * is in the room; the transport still waits for it.
 */
export function isImmersivePickerRowSelectable(
  cell: HeadsetLibraryCell,
): boolean {
  return cell.type === 'on-headset' || cell.type === 'offline-on-headset'
}

function activityLabel(activity: 'CYCLING' | 'WALKING' | null): string | null {
  if (activity === 'CYCLING') return i18next.t('immersive.cycling')
  if (activity === 'WALKING') return i18next.t('immersive.walking')
  return null
}

export function immersivePickerMetaLine(input: {
  activity: 'CYCLING' | 'WALKING' | null
  durationSec: number | null
}): string {
  return [activityLabel(input.activity), formatDurationLabel(input.durationSec)]
    .filter((part): part is string => part != null && part.length > 0)
    .join(' · ')
}

export function immersiveSelectedMetaLine(input: {
  activity: 'CYCLING' | 'WALKING' | null
}): string {
  const activity =
    activityLabel(input.activity) ?? i18next.t('immersive.activity')
  return `${activity} · 180° FPV`
}

export function immersiveHeadsetGateCopy(input: {
  roomComplete: boolean
  replaced: boolean
  pollOnline: boolean
}): string | null {
  if (input.replaced || input.roomComplete) return null
  if (input.pollOnline) return i18next.t('immersive.gateConnecting')
  return i18next.t('immersive.gateTurnOn')
}
