import { describe, expect, it } from 'vitest'
import { classifySession, getSessionTiming } from './session-type.ts'

describe('classifySession', () => {
  it('reads a session with no video as exercise', () => {
    expect(classifySession({ videoMinutes: null })).toBe('exercise')
  })

  it('reads a session with video as vr', () => {
    expect(classifySession({ videoMinutes: 12 })).toBe('vr')
  })
})

describe('getSessionTiming', () => {
  const base = {
    createdAt: '2026-11-02T10:00:00.000Z',
    completedAt: '2026-11-02T10:40:00.000Z',
  }

  it('times a completed session from start to completion', () => {
    expect(
      getSessionTiming({ ...base, deletedAt: null, videoMinutes: null }),
    ).toEqual({
      type: 'exercise',
      totalMinutes: 40,
    })
    expect(
      getSessionTiming({ ...base, deletedAt: null, videoMinutes: 30 }),
    ).toEqual({
      type: 'vr',
      totalMinutes: 40,
    })
  })

  it('has no duration while a session is not completed', () => {
    expect(
      getSessionTiming({
        createdAt: base.createdAt,
        completedAt: null,
        deletedAt: null,
        videoMinutes: null,
      }).totalMinutes,
    ).toBeNull()
  })

  it('ends a Don’t Save session when it was deleted', () => {
    expect(
      getSessionTiming({
        createdAt: base.createdAt,
        completedAt: null,
        deletedAt: '2026-11-02T10:07:00.000Z',
        videoMinutes: null,
      }).totalMinutes,
    ).toBe(7)
  })
})
