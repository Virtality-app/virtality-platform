import { UserSchema } from '@virtality/db/definitions'
import { authed } from '../../middleware/auth.ts'
import { auth } from '@virtality/auth'
import {
  CONSOLE_URL,
  CONSOLE_URL_LOCAL,
  CONSOLE_URL_STAGING,
} from '@virtality/shared/types'

const baseURL =
  process.env.ENV === 'production'
    ? CONSOLE_URL
    : process.env.ENV === 'preview'
      ? CONSOLE_URL_STAGING
      : CONSOLE_URL_LOCAL

export const updateUserEmail = authed
  .route({ path: '/user/update-email', method: 'POST' })
  .input(UserSchema.pick({ email: true }))
  .handler(async ({ context, input }) => {
    const { user } = context

    await auth.api.changeEmail({
      headers: context.headers,
      request: context.request,
      body: {
        newEmail: input.email,
        callbackURL: `${baseURL}/change-email/pending?newEmail=${encodeURIComponent(input.email)}`,
      },
    })
  })
