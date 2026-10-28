import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { testI18n } from '@/i18n/test-i18n'
import AutoLaunchStatus from './auto-launch-status'

afterEach(async () => {
  cleanup()
  await act(() => testI18n.changeLanguage('en'))
})

describe('AutoLaunchStatus', () => {
  it('says what it is waiting for in English', () => {
    render(<AutoLaunchStatus connected />)
    expect(
      screen.getByText('Waiting for the headset, then launching…'),
    ).toBeInTheDocument()
  })

  it('shows the Greek draft when el is selected', async () => {
    await act(() => testI18n.changeLanguage('el'))
    render(<AutoLaunchStatus connected={false} />)
    expect(screen.getByText('Σύνδεση με το headset…')).toBeInTheDocument()
  })
})
