import { describe, expect, it } from 'vitest'
import {
  getCastingControlAction,
  getCastingControlLabel,
  getCastingControlLabelForAction,
  getCastingPlayerView,
  getCastingStatusLabel,
  isCastingControlDisabled,
  shouldShowVideoControls,
  shouldShowVideoElement,
} from './patient-dashboard-casting-panel.js'

describe('patient dashboard casting panel player view', () => {
  it('shows idle preview before casting starts', () => {
    expect(getCastingPlayerView('idle')).toBe('idle')
  })

  it('shows loading during the casting load window', () => {
    expect(getCastingPlayerView('requesting')).toBe('loading')
    expect(getCastingPlayerView('negotiating')).toBe('loading')
  })

  it('shows connected when the stream is live', () => {
    expect(getCastingPlayerView('connected')).toBe('connected')
  })

  it('shows error when casting fails', () => {
    expect(getCastingPlayerView('error')).toBe('error')
  })
})

describe('patient dashboard casting panel control', () => {
  it('uses one button that starts from idle and stops while active', () => {
    expect(getCastingControlAction('idle')).toBe('start')
    expect(getCastingControlAction('error')).toBe('start')
    expect(getCastingControlAction('requesting')).toBe('stop')
    expect(getCastingControlAction('negotiating')).toBe('stop')
    expect(getCastingControlAction('connected')).toBe('stop')
  })

  it('labels the control Start casting or Stop casting', () => {
    expect(getCastingControlLabelForAction('start')).toBe('Start casting')
    expect(getCastingControlLabelForAction('stop')).toBe('Stop casting')
    expect(getCastingControlLabel('idle')).toBe('Start casting')
    expect(getCastingControlLabel('error')).toBe('Start casting')
    expect(getCastingControlLabel('connected')).toBe('Stop casting')
  })

  it('disables start when the console socket is disconnected', () => {
    expect(isCastingControlDisabled('idle', false)).toBe(true)
    expect(isCastingControlDisabled('error', false)).toBe(true)
    expect(isCastingControlDisabled('idle', true)).toBe(false)
  })

  it('keeps stop enabled while casting is active', () => {
    expect(isCastingControlDisabled('requesting', false)).toBe(false)
    expect(isCastingControlDisabled('connected', false)).toBe(false)
  })
})

describe('patient dashboard casting panel status label', () => {
  it('exposes a readable status for each casting phase', () => {
    expect(getCastingStatusLabel('idle')).toBe('Idle')
    expect(getCastingStatusLabel('requesting')).toBe('Requesting stream...')
    expect(getCastingStatusLabel('negotiating')).toBe('Connecting...')
    expect(getCastingStatusLabel('connected')).toBe('Live')
    expect(getCastingStatusLabel('error')).toBe('Connection failed')
  })
})

describe('patient dashboard casting panel video', () => {
  it('mounts the video element only when loading or connected', () => {
    expect(shouldShowVideoElement('idle')).toBe(false)
    expect(shouldShowVideoElement('error')).toBe(false)
    expect(shouldShowVideoElement('loading')).toBe(true)
    expect(shouldShowVideoElement('connected')).toBe(true)
  })

  it('never exposes native video controls', () => {
    expect(shouldShowVideoControls('idle')).toBe(false)
    expect(shouldShowVideoControls('loading')).toBe(false)
    expect(shouldShowVideoControls('connected')).toBe(false)
    expect(shouldShowVideoControls('error')).toBe(false)
  })
})
