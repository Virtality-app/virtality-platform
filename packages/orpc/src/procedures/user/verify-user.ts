import { authed } from '../../middleware/auth.ts'
import { UserSchema } from '@virtality/db/definitions'

// The Verify email page polls this for the address it was sent to. It only
// answers for the caller's own account: another user's email gets undefined,
// so it can't be used to find out who has an account.
export const isUserVerified = authed
  .route({ path: '/user/is-verified', method: 'GET' })
  .input(UserSchema.pick({ email: true }))
  .handler(async ({ context, input }) => {
    const { prisma, user } = context
    const result = await prisma.user.findFirst({
      where: { id: user.id, email: input.email, deletedAt: null },
      select: { emailVerified: true },
    })
    return result?.emailVerified
  })
