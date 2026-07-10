import type { WaitlistSchemaType } from '@virtality/shared/types'

export type WaitlistNotifyLogger = {
  warn: (event: string, meta?: Record<string, unknown>) => void
  info: (event: string, meta?: Record<string, unknown>) => void
}

export type CreateWaitlistDeps = {
  prisma: {
    waitingList: {
      findFirst: (args: {
        where: { email: string }
      }) => Promise<{ id: string; email: string } | null>
      create: (args: {
        data: {
          id: string
          email: string
          createdAt: Date
          plan?: string | null
        }
      }) => Promise<unknown>
    }
  }
  generateId: () => string
  now: () => Date
  getNotifyRecipient: () => string | undefined
  sendWaitlistNotification: (input: {
    recipient: string
    email: string
  }) => Promise<void>
  logger: WaitlistNotifyLogger
}

export type CreateWaitlistResult =
  | { success: true; message: null }
  | { success: false; message: string }

export function getWaitlistNotifyRecipient(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const value = env.WAITLIST_NOTIFY_EMAIL?.trim()
  return value || undefined
}

export async function notifyWaitlistTeam(
  deps: {
    recipient: string | undefined
    sendWaitlistNotification: CreateWaitlistDeps['sendWaitlistNotification']
    logger: WaitlistNotifyLogger
  },
  input: { email: string },
): Promise<'sent' | 'skipped'> {
  if (!deps.recipient) {
    deps.logger.warn('waitlist.notify.skipped', {
      reason: 'WAITLIST_NOTIFY_EMAIL not configured',
    })
    return 'skipped'
  }

  await deps.sendWaitlistNotification({
    recipient: deps.recipient,
    email: input.email,
  })
  deps.logger.info('waitlist.notify.sent', {
    recipient: deps.recipient,
  })
  return 'sent'
}

export async function createWaitlistEntry(
  deps: CreateWaitlistDeps,
  input: WaitlistSchemaType,
): Promise<CreateWaitlistResult> {
  const exists = await deps.prisma.waitingList.findFirst({
    where: { email: input.email },
  })

  if (exists) {
    return { success: false, message: 'You are already on the waitlist.' }
  }

  await deps.prisma.waitingList.create({
    data: {
      id: deps.generateId(),
      ...input,
      createdAt: deps.now(),
    },
  })

  await notifyWaitlistTeam(
    {
      recipient: deps.getNotifyRecipient(),
      sendWaitlistNotification: deps.sendWaitlistNotification,
      logger: deps.logger,
    },
    { email: input.email },
  )

  return { success: true, message: null }
}
