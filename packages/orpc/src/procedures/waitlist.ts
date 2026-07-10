import { WaitlistSchema } from '@virtality/shared/types'
import { generateUUID } from '@virtality/shared/utils'
import { sendWaitlistNotification } from '@virtality/nodemailer'
import { base } from '../context.ts'
import {
  createWaitlistEntry,
  getWaitlistNotifyRecipient,
} from './waitlist/waitlist-create.ts'

const waitlistLogger = {
  warn: (event: string, meta?: Record<string, unknown>) => {
    console.warn(event, meta)
  },
  info: (event: string, meta?: Record<string, unknown>) => {
    console.info(event, meta)
  },
}

const listWaitlist = base
  .route({ path: '/waitlist/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context
    const waitlist = await prisma.waitingList.findMany({
      where: {
        AND: [{ deletedAt: null }],
      },
    })
    return waitlist
  })

const createWaitlist = base
  .route({ path: '/waitlist/create', method: 'POST' })
  .input(WaitlistSchema)
  .handler(
    async ({
      context,
      input,
    }): Promise<
      { success: true; message: null } | { success: false; message: string }
    > => {
      const { prisma } = context

      return createWaitlistEntry(
        {
          prisma,
          generateId: generateUUID,
          now: () => new Date(),
          getNotifyRecipient: getWaitlistNotifyRecipient,
          sendWaitlistNotification,
          logger: waitlistLogger,
        },
        input,
      )
    },
  )

export const waitlist = {
  list: listWaitlist,
  create: createWaitlist,
}
