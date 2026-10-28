import i18next from '@/i18n/i18next'
import type { CastingStatus } from '@/hooks/use-casting-handshake'

export type CastingPlayerView = 'idle' | 'loading' | 'connected' | 'error'

export type CastingControlAction = 'start' | 'stop'

export const CASTING_LOAD_TIMEOUT_MS = 30_000

const CASTING_CONTROL_LABEL_KEYS: Record<CastingControlAction, string> = {
  start: 'casting.start',
  stop: 'casting.stop',
}

export function getCastingPlayerView(status: CastingStatus): CastingPlayerView {
  switch (status) {
    case 'idle':
      return 'idle'
    case 'requesting':
    case 'negotiating':
      return 'loading'
    case 'connected':
      return 'connected'
    case 'error':
      return 'error'
  }
}

export function getCastingControlAction(
  status: CastingStatus,
): CastingControlAction {
  switch (status) {
    case 'idle':
    case 'error':
      return 'start'
    case 'requesting':
    case 'negotiating':
    case 'connected':
      return 'stop'
  }
}

export function getCastingControlLabelForAction(
  action: CastingControlAction,
): string {
  return i18next.t(CASTING_CONTROL_LABEL_KEYS[action])
}

export function getCastingControlLabel(status: CastingStatus): string {
  return getCastingControlLabelForAction(getCastingControlAction(status))
}

export function isCastingControlDisabled(
  status: CastingStatus,
  connected: boolean,
): boolean {
  return getCastingControlAction(status) === 'start' && !connected
}

export function getCastingStatusLabel(status: CastingStatus): string {
  switch (status) {
    case 'idle':
      return i18next.t('casting.status.idle')
    case 'requesting':
      return i18next.t('casting.status.requesting')
    case 'negotiating':
      return i18next.t('casting.status.negotiating')
    case 'connected':
      return i18next.t('casting.status.connected')
    case 'error':
      return i18next.t('casting.status.error')
  }
}

export function shouldShowVideoElement(view: CastingPlayerView): boolean {
  return view === 'loading' || view === 'connected'
}

export function shouldShowVideoControls(): boolean {
  return false
}

export function isCastingLoadWindow(view: CastingPlayerView): boolean {
  return view === 'loading'
}

export function shouldShowCastingTimeoutPrompt(
  view: CastingPlayerView,
  hasLoadTimedOut: boolean,
): boolean {
  return isCastingLoadWindow(view) && hasLoadTimedOut
}
