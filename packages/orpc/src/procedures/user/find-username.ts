import { authed } from '../../middleware/auth.ts'

export const findUsername = authed
  .route({ path: '/user/get-username', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma, user } = context
    const result = await prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    })
    return result?.name
  })
