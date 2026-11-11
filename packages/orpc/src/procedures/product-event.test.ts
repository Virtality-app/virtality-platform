import { call } from '@orpc/server'
import { describe, expect, it, vi } from 'vitest'
import { productEvent } from './product-event.ts'

const EVENT_ID = '019a7c3e-8f2b-7c41-9d3e-2b6f4a1c8e57'

function contextFor(userId: string | null) {
  const prisma = {
    productEvent: { createMany: vi.fn(async () => ({ count: 1 })) },
  }
  return {
    prisma,
    context: {
      prisma,
      user: userId ? { id: userId, role: 'user' } : null,
      session: userId ? { id: 's1' } : null,
      headers: new Headers(),
    } as never,
  }
}

describe('productEvent.track', () => {
  it('saves the event for the signed-in user', async () => {
    const { context, prisma } = contextFor('user-1')

    await call(
      productEvent.track,
      {
        id: EVENT_ID,
        event: 'patient_tab_viewed',
        properties: { tab: 'sessions' },
        sessionId: 'ph-session-1',
      },
      { context },
    )

    expect(prisma.productEvent.createMany).toHaveBeenCalledWith({
      data: [
        {
          id: EVENT_ID,
          event: 'patient_tab_viewed',
          properties: { tab: 'sessions' },
          sessionId: 'ph-session-1',
          userId: 'user-1',
          source: 'client',
        },
      ],
      skipDuplicates: true,
    })
  })

  it('is UNAUTHORIZED without a session', async () => {
    const { context } = contextFor(null)

    await expect(
      call(
        productEvent.track,
        { id: EVENT_ID, event: 'warmup_started', properties: {} },
        { context },
      ),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('rejects event names outside the client contract', async () => {
    const { context, prisma } = contextFor('user-1')

    for (const event of ['program_created', 'made_up_event']) {
      await expect(
        call(
          productEvent.track,
          { id: EVENT_ID, event, properties: {} } as never,
          { context },
        ),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    }
    expect(prisma.productEvent.createMany).not.toHaveBeenCalled()
  })

  it('rejects nested, oversized or too many properties', async () => {
    const { context } = contextFor('user-1')
    const tooMany = Object.fromEntries(
      Array.from({ length: 21 }, (_, i) => [`p${i}`, i]),
    )

    for (const properties of [
      { tab: { nested: true } },
      { tab: 'x'.repeat(257) },
      tooMany,
    ]) {
      await expect(
        call(
          productEvent.track,
          { id: EVENT_ID, event: 'patient_tab_viewed', properties } as never,
          { context },
        ),
      ).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    }
  })
})
