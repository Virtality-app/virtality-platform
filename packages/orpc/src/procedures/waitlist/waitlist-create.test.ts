import { describe, expect, it, vi } from 'vitest'
import {
  createWaitlistEntry,
  getWaitlistNotifyRecipient,
  notifyWaitlistTeam,
  type CreateWaitlistDeps,
} from './waitlist-create.ts'

const now = new Date('2026-07-10T12:00:00.000Z')

function createDeps(
  overrides: Partial<CreateWaitlistDeps> & {
    existingEmails?: string[]
  } = {},
) {
  const records: Array<{ id: string; email: string; createdAt: Date }> = (
    overrides.existingEmails ?? []
  ).map((email, index) => ({
    id: `existing-${index}`,
    email,
    createdAt: now,
  }))

  const sendWaitlistNotification = vi.fn().mockResolvedValue(undefined)
  const logger = {
    warn: vi.fn(),
    info: vi.fn(),
  }

  const deps: CreateWaitlistDeps = {
    prisma: {
      waitingList: {
        findFirst: vi.fn(
          async ({ where }: { where: { email: string } }) =>
            records.find((record) => record.email === where.email) ?? null,
        ),
        create: vi.fn(
          async ({ data }: { data: { id: string; email: string } }) => {
            records.push({
              id: data.id,
              email: data.email,
              createdAt: now,
            })
          },
        ),
      },
    } as CreateWaitlistDeps['prisma'],
    generateId: vi.fn(() => 'waitlist-new'),
    now: vi.fn(() => now),
    getNotifyRecipient: vi.fn(() => 'team@virtality.app'),
    sendWaitlistNotification,
    logger,
    ...overrides,
  }

  return { deps, sendWaitlistNotification, logger, records }
}

describe('getWaitlistNotifyRecipient', () => {
  it('reads WAITLIST_NOTIFY_EMAIL from the environment', () => {
    expect(
      getWaitlistNotifyRecipient({
        WAITLIST_NOTIFY_EMAIL: '  team@virtality.app  ',
      } as NodeJS.ProcessEnv),
    ).toBe('team@virtality.app')
  })

  it('returns undefined when WAITLIST_NOTIFY_EMAIL is missing or blank', () => {
    expect(getWaitlistNotifyRecipient({} as NodeJS.ProcessEnv)).toBeUndefined()
    expect(
      getWaitlistNotifyRecipient({
        WAITLIST_NOTIFY_EMAIL: '   ',
      } as NodeJS.ProcessEnv),
    ).toBeUndefined()
  })
})

describe('notifyWaitlistTeam', () => {
  it('sends the internal notification when a recipient is configured', async () => {
    const sendWaitlistNotification = vi.fn().mockResolvedValue(undefined)
    const logger = { warn: vi.fn(), info: vi.fn() }

    const result = await notifyWaitlistTeam(
      {
        getNotifyRecipient: () => 'team@virtality.app',
        sendWaitlistNotification,
        logger,
      },
      { email: 'clinic@example.com' },
    )

    expect(result).toBe('sent')
    expect(sendWaitlistNotification).toHaveBeenCalledWith({
      recipient: 'team@virtality.app',
      email: 'clinic@example.com',
    })
    expect(logger.info).toHaveBeenCalledWith('waitlist.notify.sent', {
      recipient: 'team@virtality.app',
    })
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('skips notification and warns when WAITLIST_NOTIFY_EMAIL is not configured', async () => {
    const sendWaitlistNotification = vi.fn().mockResolvedValue(undefined)
    const logger = { warn: vi.fn(), info: vi.fn() }

    const result = await notifyWaitlistTeam(
      {
        getNotifyRecipient: () => undefined,
        sendWaitlistNotification,
        logger,
      },
      { email: 'clinic@example.com' },
    )

    expect(result).toBe('skipped')
    expect(sendWaitlistNotification).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalledWith('waitlist.notify.skipped', {
      reason: 'WAITLIST_NOTIFY_EMAIL not configured',
    })
    expect(logger.info).not.toHaveBeenCalled()
  })
})

describe('createWaitlistEntry', () => {
  it('sends an internal notification after a successful new waitlist entry', async () => {
    const { deps, sendWaitlistNotification } = createDeps()

    const result = await createWaitlistEntry(deps, {
      email: 'clinic@example.com',
    })

    expect(result).toEqual({ success: true, message: null })
    expect(sendWaitlistNotification).toHaveBeenCalledWith({
      recipient: 'team@virtality.app',
      email: 'clinic@example.com',
    })
  })

  it('does not send an internal notification for duplicate waitlist submissions', async () => {
    const { deps, sendWaitlistNotification } = createDeps({
      existingEmails: ['clinic@example.com'],
    })

    const result = await createWaitlistEntry(deps, {
      email: 'clinic@example.com',
    })

    expect(result).toEqual({
      success: false,
      message: 'You are already on the waitlist.',
    })
    expect(sendWaitlistNotification).not.toHaveBeenCalled()
  })
})
