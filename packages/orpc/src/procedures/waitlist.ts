import { WaitlistSchema } from '@virtality/shared/types'
import { generateUUID } from '@virtality/shared/utils'
import { sendWaitlistNotification } from '@virtality/nodemailer'
import { createAppLogger } from '@virtality/shared/observability'
import { base } from '../context.ts'
import {
  createWaitlistEntry,
  getWaitlistNotifyRecipient,
} from './waitlist/waitlist-create.ts'

const waitlistLogger = createAppLogger({
  serviceName: 'server',
  defaultAttributes: {
    component: 'waitlist',
  },
})

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
  .handler(async ({ context, input }) =>
    createWaitlistEntry(
      {
        prisma: context.prisma,
        generateId: generateUUID,
        now: () => new Date(),
        getNotifyRecipient: getWaitlistNotifyRecipient,
        sendWaitlistNotification,
        logger: waitlistLogger,
      },
      input,
    ),
  )

export const waitlist = {
  list: listWaitlist,
  create: createWaitlist,
}
