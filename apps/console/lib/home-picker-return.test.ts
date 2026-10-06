import { describe, expect, it } from 'vitest'
import {
  homePickerHref,
  readHomePickerSeed,
  returnHrefWithChoice,
  withoutHomePickerParams,
  withReturnTo,
} from './home-picker-return'

describe('homePickerHref', () => {
  it('carries what is already picked', () => {
    expect(
      homePickerHref({ patientId: 'p1', programId: null, deviceId: 'd1' }),
    ).toBe('/?patient=p1&device=d1')
  })

  it('is the plain dashboard when nothing is picked', () => {
    expect(homePickerHref({})).toBe('/')
  })
})

describe('readHomePickerSeed', () => {
  it('reads only the picks present', () => {
    expect(
      readHomePickerSeed(new URLSearchParams('program=r1&tour=session')),
    ).toEqual({ programId: 'r1' })
  })

  it('leaves other params when the picks are dropped', () => {
    expect(
      withoutHomePickerParams(
        new URLSearchParams('patient=p1&tour=session&device=d1'),
      ),
    ).toBe('tour=session')
  })
})

describe('returning from a create page', () => {
  it('goes back to the dashboard with the new item added to the picks', () => {
    const link = withReturnTo(
      '/programs/new',
      homePickerHref({ patientId: 'p1' }),
    )
    const search = link.slice(link.indexOf('?'))

    expect(returnHrefWithChoice(search, 'programId', 'r9')).toBe(
      '/?patient=p1&program=r9',
    )
  })

  it('replaces an earlier pick of the same kind', () => {
    const link = withReturnTo(
      '/patients/new?tour=patient',
      homePickerHref({ patientId: 'p1', deviceId: 'd1' }),
    )
    const search = link.slice(link.indexOf('?'))

    expect(returnHrefWithChoice(search, 'patientId', 'p2')).toBe(
      '/?patient=p2&device=d1',
    )
  })

  it('stays put when the page was not opened from the dashboard', () => {
    expect(returnHrefWithChoice('', 'patientId', 'p2')).toBeNull()
    expect(
      returnHrefWithChoice('?returnTo=%2Fpatients', 'patientId', 'p2'),
    ).toBeNull()
  })

  it('never returns to another site', () => {
    expect(
      returnHrefWithChoice(
        `?returnTo=${encodeURIComponent('//evil.example/?x=1')}`,
        'patientId',
        'p2',
      ),
    ).toBeNull()
    expect(
      returnHrefWithChoice(
        `?returnTo=${encodeURIComponent('https://evil.example/')}`,
        'deviceId',
        'd2',
      ),
    ).toBeNull()
  })
})
