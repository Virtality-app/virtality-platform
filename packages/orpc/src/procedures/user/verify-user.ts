import { authed } from '../../middleware/auth.ts'
import { UserSchema } from '@virtality/db/definitions'

export const isUserVerified = authed
  .route({ path: '/user/is-verified', method: 'GET' })
  .input(UserSchema.pick({ email: true }))
  .handler(async ({ context, input }) => {
    const { prisma } = context
    const result = await prisma.user.findUnique({
      where: { email: input.email, AND: [{ deletedAt: null }] },
      select: { emailVerified: true },
    })
    return result?.emailVerified
  })
