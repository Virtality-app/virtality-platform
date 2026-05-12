import { UserSchema } from '@virtality/db/definitions'
import { authed } from '../../middleware/auth.ts'
import { z } from 'zod/v4'
import { generateImageFile } from '@virtality/shared/utils'
import { CDN_URL } from '@virtality/shared/types'
import { auth } from '@virtality/auth'

const ExtendedUserSchema = UserSchema.extend({
  image: z.instanceof(File).or(z.string()).nullable().optional(),
}).pick({
  name: true,
  phoneNumber: true,
  image: true,
})

const stripCdnPrefix = (imageUrl: string) => {
  const cdnPrefix = `${CDN_URL}/`
  return imageUrl.startsWith(cdnPrefix) ? imageUrl.slice(cdnPrefix.length) : imageUrl
}

export const updateUserInfo = authed
  .route({ path: '/user/update', method: 'POST' })
  .input(ExtendedUserSchema)
  .handler(async ({ context, input }) => {
    const { user, s3, prisma } = context

    const newImage = input?.image
    const prevImage = user?.image

    const file = await generateImageFile({
      image: newImage,
      resource: 'user',
    })

    if (prevImage && !newImage) {
      await s3.deleteFile({ Key: stripCdnPrefix(prevImage) })
    } else if (file) {
      await s3.uploadFile({
        Body: file.buffer,
        ContentType: file.ContentType,
        Key: file.Key,
      })
      if (prevImage) {
        await s3.deleteFile({ Key: stripCdnPrefix(prevImage) })
      }
    }

    const image =
      file !== null
        ? `${CDN_URL}/${file.Key}`
        : prevImage && !newImage
          ? null
          : undefined

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
        phoneNumber: input.phoneNumber ?? null,
        ...(image !== undefined && { image }),
      },
    })

    await auth.api.updateUser({
      headers: context.headers,
      body: {
        name: input.name,
        ...(image !== undefined && { image }),
      },
    })

    return prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
      },
    })
  })
