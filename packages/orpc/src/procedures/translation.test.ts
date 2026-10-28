import { call } from '@orpc/server'
import { describe, expect, it, vi } from 'vitest'
import { translation } from './translation.ts'

function contextFor(role: string | null) {
  const prisma = {
    translation: {
      findMany: vi.fn(async () => []),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  }
  return {
    prisma,
    context: {
      prisma,
      user: role ? { id: 'u1', role } : null,
      session: role ? { id: 's1' } : null,
      headers: new Headers(),
    } as never,
  }
}

describe('translation procedures', () => {
  it('bundle is public and merges catalog defaults', async () => {
    const { context } = contextFor(null)
    const bundle = await call(
      translation.bundle,
      { locale: 'en', namespace: 'patient-dashboard' },
      { context },
    )
    expect(bundle['start-btn']).toBe('Start')
  })

  it('bundle applies database rows', async () => {
    const { context, prisma } = contextFor(null)
    prisma.translation.findMany.mockResolvedValue([
      { key: 'start-btn', value: 'Go' },
    ] as never)
    const bundle = await call(
      translation.bundle,
      { locale: 'en', namespace: 'patient-dashboard' },
      { context },
    )
    expect(bundle['start-btn']).toBe('Go')
  })

  it('list, upsert and reset are FORBIDDEN for a clinician', async () => {
    const { context } = contextFor('clinician')
    const key = { locale: 'el', namespace: 'common', key: 'btn.save' }
    await expect(call(translation.list, {}, { context })).rejects.toMatchObject(
      { code: 'FORBIDDEN' },
    )
    await expect(
      call(translation.upsert, { ...key, value: 'x' }, { context }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
    await expect(
      call(translation.reset, key, { context }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('list works for an admin', async () => {
    const { context } = contextFor('admin')
    const items = await call(
      translation.list,
      { locale: 'el', namespace: 'avatar' },
      { context },
    )
    expect(items[0]).toMatchObject({ key: 'home_page', status: 'needs-review' })
  })
})
