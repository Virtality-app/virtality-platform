import { authed } from '../../middleware/auth.ts'

export const listUsers = authed
  .route({ path: '/user/list', method: 'GET' })
  .handler(async ({ context }) => {
    const { prisma } = context
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
        createdAt: true,
        emailVerified: true,
        banned: true,
      },
    })
    return { data: { users } }
  })
