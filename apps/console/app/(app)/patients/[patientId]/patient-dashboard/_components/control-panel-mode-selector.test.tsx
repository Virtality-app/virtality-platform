import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import ModeSelector from './control-panel-mode-selector'
import { TooltipProvider } from '@/components/ui/tooltip'

beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  HTMLElement.prototype.scrollIntoView ??= () => {}
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderSelector(
  props: Partial<ComponentProps<typeof ModeSelector>> = {},
) {
  const setSelectedMode = vi.fn()
  render(
    <TooltipProvider delayDuration={0}>
      <ModeSelector
        selectedMode='main'
        setSelectedMode={setSelectedMode}
        programState='ready'
        playbackStatus='Idle'
        {...props}
      />
    </TooltipProvider>,
  )
  return { setSelectedMode }
}

describe('ModeSelector', () => {
  it('includes the Immersive Video option', () => {
    renderSelector()
    fireEvent.click(screen.getByRole('combobox'))
    expect(
      screen.getByRole('option', { name: 'Immersive Video' }),
    ).toBeInTheDocument()
  })

  it.each(['started', 'paused', 'launching'] as const)(
    'disables switching into immersive when the program is %s',
    (programState) => {
      renderSelector({ programState })
      expect(screen.getByRole('combobox')).toBeDisabled()
    },
  )

  it('disables leaving immersive while playback is active and shows the tooltip', () => {
    renderSelector({
      selectedMode: 'immersive',
      playbackStatus: 'Playing',
    })

    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(
      screen.getByText('Stop the video to change mode.'),
    ).toBeInTheDocument()
  })
})
